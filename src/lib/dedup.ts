import { SubscriptionEvent } from './types/subscription';

/** 비교용으로 제목에서 공백/기호만 제거한다(단어 단위로 걷어내면 "…공급공고" 같은 접미어가 남아 오히려 불일치가 남).*/
function normalizeTitle(title: string): string {
  return title.replace(/[\s()（）\-·・,.]/g, '').toLowerCase();
}

/**
 * LH는 흔히 "…공급공고", "…입주자모집공고" 같은 접미어를 붙이므로 완전 일치 대신
 * 포함관계로 비교한다. 짧은 문자열(4자 미만)은 우연히 겹칠 위험이 커서 완전 일치만 허용한다.
 */
function titlesLikelyMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.length < 4 || b.length < 4) return a === b;
  return a.includes(b) || b.includes(a);
}

/**
 * 지역 문자열이 서로 양립 가능한지(둘 다 있을 때만 확인). LH는 "경기도" 같은 짧은 시/도명을,
 * HOME은 "경기도 수원시 권선구 …" 같은 전체 주소를 쓰므로, 앞 토큰이 같거나 한쪽이 다른 쪽에
 * 포함되면 같은 지역으로 본다. 정보가 없거나 "전국"이면 지역으로는 걸러내지 않는다.
 */
function regionsCompatible(a: string | undefined, b: string | undefined): boolean {
  const na = (a || '').trim();
  const nb = (b || '').trim();
  if (!na || !nb) return true;
  if (na === '전국' || nb === '전국') return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const firstA = na.split(/\s+/)[0];
  const firstB = nb.split(/\s+/)[0];
  return firstA === firstB;
}

function toTime(dateStr: string): number | null {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? null : t;
}

/** 두 접수기간이 겹치거나, toleranceDays 이내로 근접해 있으면 true. */
function datesOverlapOrClose(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
  toleranceDays = 3
): boolean {
  const aStartT = toTime(aStart);
  const bStartT = toTime(bStart);
  if (aStartT === null || bStartT === null) return false;

  const aEndT = toTime(aEnd) ?? aStartT;
  const bEndT = toTime(bEnd) ?? bStartT;
  const toleranceMs = toleranceDays * 24 * 60 * 60 * 1000;

  return aStartT - toleranceMs <= bEndT && bStartT - toleranceMs <= aEndT;
}

/**
 * LH와 청약홈(HOME)에 같은 단지가 중복 게시되는 경우를 정리한다.
 *
 * LH와 HOME은 서로 다른 식별체계를 쓰기 때문에(단지코드 등 공통 키가 없음) 정확한 키 조인은
 * 불가능하다. 대신 (1) 정규화한 제목이 포함관계로 겹치고, (2) 지역이 양립 가능하고,
 * (3) 접수기간이 겹치거나 근접한 경우만 중복으로 간주하는 규칙을 쓴다 — 서로 다른 두 단지를
 * 잘못 합쳐서 정보를 잃는 것보다, 드물게 진짜 중복을 놓치는 쪽이 안전하다.
 *
 * 중복으로 판정되면 필드가 더 풍부한 HOME 쪽을 남기고 LH 쪽을 제거한다.
 * 같은 소스 내부의 중복(원본 데이터 자체의 문제)은 건드리지 않는다.
 */
export function dedupeEvents(events: SubscriptionEvent[]): SubscriptionEvent[] {
  const homeEvents = events.filter((e) => e.source === 'HOME');
  const lhEvents = events.filter((e) => e.source === 'LH');

  const homeNormalized = homeEvents.map((event) => ({ event, norm: normalizeTitle(event.title) }));

  const survivingLh = lhEvents.filter((lhEvent) => {
    const lhNorm = normalizeTitle(lhEvent.title);
    if (!lhNorm) return true;

    const isDuplicate = homeNormalized.some(
      ({ event: homeEvent, norm }) =>
        titlesLikelyMatch(norm, lhNorm) &&
        regionsCompatible(lhEvent.region, homeEvent.region) &&
        datesOverlapOrClose(lhEvent.startDate, lhEvent.endDate, homeEvent.startDate, homeEvent.endDate)
    );
    return !isDuplicate;
  });

  return [...homeEvents, ...survivingLh];
}
