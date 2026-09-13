import { SubscriptionEvent } from '../types/subscription';
import { fetchChungyakHome } from './chungyak-home';
import { fetchLH } from './lh';
import { dedupeEvents } from '../dedup';

let cachedSubscriptions: SubscriptionEvent[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

export async function getAllSubscriptions(): Promise<SubscriptionEvent[]> {
  const now = Date.now();
  if (cachedSubscriptions && (now - lastFetchTime < CACHE_TTL)) {
    console.log(`[CACHE] Returning ${cachedSubscriptions.length} items from memory`);
    return cachedSubscriptions;
  }

  console.log(`[DEBUG] Fetching subscriptions at ${new Date().toLocaleString('ko-KR')} (Server-side)`);

  try {
    const results = await Promise.allSettled([
      fetchChungyakHome(),
      fetchLH(),
    ]);

    const combined: SubscriptionEvent[] = [];
    const sourceNames = ['HOME', 'LH'];

    results.forEach((res, i) => {
      if (res.status === 'fulfilled') {
        const count = Array.isArray(res.value) ? res.value.length : 0;
        console.log(`[API:${sourceNames[i]}] ✅ Fetched ${count} items`);
        if (count > 0) combined.push(...res.value);
      } else {
        console.error(`[API:${sourceNames[i]}] ❌ Failed:`, res.reason);
      }
    });

    console.log(`[TOTAL] Combined ${combined.length} items`);

    const deduped = dedupeEvents(combined);
    if (deduped.length !== combined.length) {
      console.log(`[DEDUP] Removed ${combined.length - deduped.length} LH announcements already listed on 청약홈`);
    }

    // 2026년 이후 데이터만 필터링 (빌드 및 런타임 최적화)
    const currentYear = new Date().getFullYear(); // 2026
    const targetYearStr = `${currentYear}-01-01`;
    const filtered = deduped.filter(e => e.id && (e.startDate >= targetYearStr)).sort((a, b) => a.startDate.localeCompare(b.startDate));

    console.log(`[DATA AUDIT] Filtered 2026+ Total: ${filtered.length} items (Excluded ${deduped.length - filtered.length} legacy items)`);

    cachedSubscriptions = filtered;
    lastFetchTime = now;

    return filtered;
  } catch (error) {
    console.error('API Aggregation Error:', error);
    return [];
  }
}
