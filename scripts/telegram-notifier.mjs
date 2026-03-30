import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { isSameDay } from 'date-fns';
import axios from 'axios';
import { sendNotification } from '../../antigravity-bot/scripts/notify.mjs';

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

async function runNotifier() {
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

  if (todayEvents.length === 0) {
    message += `\n${divider}\n💡 오늘 새로 시작되는 청약 일정이 없습니다.\n${divider}\n\n📎 [전체 일정 달력 보기](https://bsjuu.github.io/housingcalendar/)`;
  } else {
    message += `\n${divider}\n`;
    todayEvents.forEach((ev, i) => {
      message += `*${i + 1} / ${todayEvents.length}건*\n\n`;
      message += `🏢 *${ev.title}*\n`;
      message += `🏷 ${ev.source}\n`;
      message += `📍 ${ev.region}\n`;
      message += `📆 접수 시작: ${formatStartDate(ev.startDate)}\n`;
      message += `${divider}\n`;
    });
    message += `\n📎 [전체 일정 달력 보기](https://bsjuu.github.io/housingcalendar/)`;
  }
  await sendTelegram(message);
}

// 11:50 AM (주력)
cron.schedule('50 11 * * *', () => {
  runNotifier().catch(e => console.error('[Housing] runNotifier 실패:', e.message));
}, { timezone: 'Asia/Seoul' });

// 18:50 PM (백업)
cron.schedule('50 18 * * *', () => {
  runNotifier().catch(e => console.error('[Housing] runNotifier 실패:', e.message));
}, { timezone: 'Asia/Seoul' });

console.log('✅ Housing Notifier (ID 7) 가동 중 (11:50, 18:50 Asia/Seoul)');
// runNotifier();

// 🛡️ 심폐소생기: 1시간마다 더미 작업 수행 (프로세스 종료 방지)
setInterval(() => {
  const now = new Date();
  console.log(`[Keep-Alive] 🏠 Housing Notifier 심동 감지 중... (${now.toLocaleString('ko-KR')})`);
}, 1000 * 60 * 60);

