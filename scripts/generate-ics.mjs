// 빌드 시점에 전체 청약 일정을 public/calendar.ics로 정적 생성한다.
// output:export(정적 사이트)라 런타임 서버가 없으므로, "구독"은 이 정적 파일을 가리키는 형태로만 가능하다.
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// next build/dev는 .env.local을 자동으로 읽지만, 이 스크립트는 Next 밖에서 tsx로 직접
// 실행되므로 명시적으로 로드해야 한다.
config({ path: path.resolve(process.cwd(), '.env.local') });

const { getAllSubscriptions } = await import('../src/lib/api/index.ts');
const { buildIcsCalendar } = await import('../src/lib/ics.ts');

async function main() {
  const outPath = path.resolve(process.cwd(), 'public', 'calendar.ics');
  const events = await getAllSubscriptions();

  // getAllSubscriptions()는 내부적으로 fetch 실패를 삼키고 빈 배열을 돌려줄 수 있다.
  // 그 상태로 그냥 쓰면 일시적 API 장애가 "빈 캘린더"로 배포돼 버리므로, 기존에 파일이
  // 있었다면 덮어쓰지 않고 그대로 둔다(마지막으로 성공한 버전을 유지하는 게 빈 파일보다 낫다).
  if (events.length === 0) {
    const hasExisting = fs.existsSync(outPath);
    console.error(
      `[ICS] Fetched 0 events — ${hasExisting ? 'keeping previous calendar.ics as-is' : 'no previous file to keep'}.`
    );
    if (!hasExisting) {
      throw new Error('No events fetched and no previous calendar.ics to fall back to');
    }
    return;
  }

  const ics = buildIcsCalendar(events, '청약 일정 (전체)');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ics, 'utf-8');

  console.log(`[ICS] Wrote ${events.length} events to ${outPath}`);
}

main().catch((error) => {
  // ICS 생성 실패로 전체 빌드를 막지 않는다 — 사이트 본체가 더 중요하므로 경고만 남긴다.
  console.error('[ICS] Generation failed (non-fatal):', error);
});
