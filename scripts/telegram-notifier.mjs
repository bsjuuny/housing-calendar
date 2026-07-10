import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { isSameDay } from 'date-fns';
import axios from 'axios';
import { sendNotification } from '../../antigravity-bot/scripts/notify.mjs';

// ── 단일 인스턴스 보장 (PID 파일 락) ──────────────────────────
const PID_FILE = path.resolve(process.cwd(), 'data/notifier.pid');

function acquireLock() {
  fs.mkdirSync(path.dirname(PID_FILE), { recursive: true });
  try {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
    if (existingPid && existingPid !== process.pid) {
      try {
        process.kill(existingPid, 0); // 프로세스 존재 확인 (신호 0 = 체크만)
        console.error(`[PID Lock] 이미 실행 중인 인스턴스 감지 (PID: ${existingPid}). 종료합니다.`);
        process.exit(0);
      } catch (err) {
        if (err.code === 'EPERM') {
          // Windows에서 EPERM = 프로세스가 존재하지만 신호를 보낼 권한 없음 → 살아있음으로 처리
          console.error(`[PID Lock] 이미 실행 중인 인스턴스 감지 (PID: ${existingPid}, EPERM). 종료합니다.`);
          process.exit(0);
        }
        // ESRCH = 프로세스 없음 (죽은 PID) → 락 파일 덮어쓰기 진행
      }
    }
  } catch { /* PID 파일 없으면 그냥 통과 */ }
  fs.writeFileSync(PID_FILE, String(process.pid));
  // 프로세스 종료 시 PID 파일 정리
  process.on('exit', () => { try { fs.unlinkSync(PID_FILE); } catch {} });
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT',  () => process.exit(0));
}

acquireLock();
// ───────────────────────────────────────────────────────────────

const SENT_LOG = path.resolve(process.cwd(), 'data/notifier_sent.json');

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function alreadySentToday(scheduleKey) {
  try {
    const data = JSON.parse(fs.readFileSync(SENT_LOG, 'utf-8'));
    return data[getTodayKey()]?.includes(scheduleKey);
  } catch { return false; }
}

function markSentToday(scheduleKey) {
  try {
    const key = getTodayKey();
    let data = {};
    try { data = JSON.parse(fs.readFileSync(SENT_LOG, 'utf-8')); } catch {}
    if (!data[key]) data[key] = [];
    if (!data[key].includes(scheduleKey)) data[key].push(scheduleKey);
    fs.mkdirSync(path.dirname(SENT_LOG), { recursive: true });
    fs.writeFileSync(SENT_LOG, JSON.stringify(data, null, 2));
  } catch (e) { console.error('[SentLog] 기록 실패:', e.message); }
}

function getEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) env[key.trim()] = value.join('=').trim();
  });
  return env;
}
const env = getEnv();

function parseDate(dateStr) {
  if (!dateStr) return null;
  const clean = dateStr.replace(/[^0-9]/g, '');
  if (clean.length === 8) {
    return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`);
  }
  return new Date(dateStr);
}

async function sendTelegram(message) {
  try {
    // 전역 notify.mjs 허브 사용 (IPv4 고정 및 안정성 확보)
    await sendNotification(message, {
      prefix: '🏠 [Housing]',
      force: true, // 청약 알림은 하루 1~2회로 적고 중요함으로 쿨타임 무시
      parse_mode: 'Markdown'
    });
  } catch (e) {
    console.error(`[Telegram] 전송 실패:`, e.message);
  }
}

async function fetchChungyakHome() {
  const API_KEY = env['CHUNGYAK_HOME_API_KEY'] || env['NEXT_PUBLIC_PUBLIC_DATA_KEY'];
  if (!API_KEY) return [];
  try {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=100&serviceKey=${API_KEY}`;
    const res = await axios.get(url, { timeout: 20000 });
    return (res.data.data || []).map(item => ({
      id: `HOME-${item.PBLANC_NO}`,
      title: item.HOUSE_NM,
      startDate: item.RCEPT_BGNDE,
      endDate: item.RCEPT_ENDDE,
      region: item.HSSPLY_ADRES,
      source: '청약홈'
    }));
  } catch (e) { return []; }
}

async function fetchLH() {
  const API_KEY = env['LH_API_KEY'] || env['NEXT_PUBLIC_PUBLIC_DATA_KEY'];
  if (!API_KEY) return [];
  try {
    const url = `https://apis.data.go.kr/B552555/lhLeaseNoticeInfo/getLeaseNoticeInfo?serviceKey=${API_KEY}&PG_SZ=100&PAGE=1&_type=json`;
    const res = await axios.get(url, { timeout: 20000 });
    const items = res.data.dsList || [];
    return items.map((item, i) => ({
      id: `LH-${item.PAN_ID || i}`,
      title: item.PAN_NM,
      startDate: item.PAN_NT_ST_DT,
      region: item.CNP_NM || '전국',
      source: 'LH'
    }));
  } catch (e) { return []; }
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateKo(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_KO[date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function formatStartDate(dateStr) {
  if (!dateStr) return '-';
  const clean = dateStr.replace(/[^0-9]/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`;
  }
  return dateStr;
}

export async function runNotifier(scheduleKey = 'default') {
  if (alreadySentToday(scheduleKey)) {
    console.log(`[${new Date().toLocaleString('ko-KR')}] ⏭️ 오늘 ${scheduleKey} 이미 발송됨 - 스킵`);
    return;
  }
  console.log(`[${new Date().toLocaleString('ko-KR')}] 🏠 청약 알림 태스크 시동...`);
  const [home, lh] = await Promise.all([fetchChungyakHome(), fetchLH()]);
  const allEvents = [...home, ...lh];
  const today = new Date();

  const todayEvents = allEvents.filter(e => {
    const sDate = parseDate(e.startDate);
    return sDate && isSameDay(sDate, today);
  });

  const divider = '─────────────────';
  let message = `🏠 *오늘의 청약 알림*\n📅 ${formatDateKo(today)}\n`;

  const MAX_SHOW = 10;

  if (todayEvents.length === 0) {
    message += `\n${divider}\n💡 오늘 새로 시작되는 청약 일정이 없습니다.\n${divider}\n\n📎 [전체 일정 달력 보기](https://bsjuu.github.io/housingcalendar/)`;
  } else {
    const showEvents = todayEvents.slice(0, MAX_SHOW);
    const remaining = todayEvents.length - showEvents.length;
    message += `\n${divider}\n`;
    showEvents.forEach((ev, i) => {
      message += `*${i + 1} / ${todayEvents.length}건*\n\n`;
      message += `🏢 *${ev.title}*\n`;
      message += `🏷 ${ev.source}\n`;
      message += `📍 ${ev.region}\n`;
      message += `📆 접수 시작: ${formatStartDate(ev.startDate)}\n`;
      message += `${divider}\n`;
    });
    if (remaining > 0) {
      message += `\n📋 외 *${remaining}건* 더 있습니다.\n`;
    }
    message += `\n📎 [전체 일정 달력 보기](https://bsjuu.github.io/housingcalendar/)`;
  }
  markSentToday(scheduleKey); // 전송 직전 마킹 (세션을 먼저 물고 들어감)
  await sendTelegram(message);
}

// 11:50 AM (주력)
// cron.schedule('50 11 * * *', () => {
//   runNotifier('morning').catch(e => console.error('[Housing] runNotifier 실패:', e.message));
// }, { timezone: 'Asia/Seoul' });

// 18:50 PM (백업)
// cron.schedule('50 18 * * *', () => {
//   runNotifier('evening').catch(e => console.error('[Housing] runNotifier 실패:', e.message));
// }, { timezone: 'Asia/Seoul' });

console.log('✅ Housing Notifier (ID 7) 가동 준비 완료 (수동/스케줄러 대기)');

// 🛡️ 심폐소생기: 1시간마다 더미 작업 수행 (프로세스 종료 방지 - 단독 실행시만 필요)
// setInterval(() => {
//   const now = new Date();
//   console.log(`[Keep-Alive] 🏠 Housing Notifier 심동 감지 중... (${now.toLocaleString('ko-KR')})`);
// }, 1000 * 60 * 60);

