import { SubscriptionEvent } from './types/subscription';

/** RFC5545 텍스트 필드 이스케이프. 줄 폴딩(75옥텟)은 생략 — 대부분의 실사용 캘린더 클라이언트가 폴딩 없는 긴 줄도 허용한다. */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** "YYYY-MM-DD" 등에서 숫자만 뽑아 ICS all-day 날짜 형식(YYYYMMDD)으로 변환. 실패 시 null. */
function toIcsDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const digits = dateStr.replace(/[^0-9]/g, '');
  return digits.length === 8 ? digits : null;
}

/** ICS all-day 이벤트의 DTEND는 종료일 다음 날(배타적 경계)이어야 한다. */
function addOneDay(yyyymmdd: string): string {
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  const date = new Date(Date.UTC(y, m, d + 1));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/** URI 값 필드(URL 등)는 TEXT 이스케이프 대상은 아니지만, 줄바꿈/제어문자가 섞여
 * 다음 줄로 값이 새는 일이 없도록 최소한의 위생 처리는 한다. */
function sanitizeIcsUri(value: string): string {
  return value.replace(/[\r\n]+/g, '').trim();
}

function formatDtstamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * 청약 이벤트 목록을 하나의 ICS(iCalendar) 텍스트로 만든다.
 * 서버(빌드 스크립트)와 브라우저 양쪽에서 쓸 수 있도록 Node 전용 API는 쓰지 않는다.
 */
export function buildIcsCalendar(events: SubscriptionEvent[], calendarName = '청약 일정'): string {
  const dtstamp = formatDtstamp(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Housing Calendar//KR',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];

  for (const event of events) {
    const startIcs = toIcsDate(event.startDate);
    if (!startIcs) continue; // 시작일을 못 읽으면 잘못된 날짜로 넣지 않고 건너뜀

    const endBase = toIcsDate(event.endDate) || startIcs;
    const endIcsExclusive = addOneDay(endBase);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(event.id)}@housing-calendar`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${startIcs}`,
      `DTEND;VALUE=DATE:${endIcsExclusive}`,
      `SUMMARY:${escapeIcsText(`[${event.source}] ${event.title}`)}`,
      `LOCATION:${escapeIcsText(event.region || '')}`
    );
    if (event.url) {
      lines.push(`URL:${sanitizeIcsUri(event.url)}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
