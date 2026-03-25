import { SubscriptionEvent } from '../types/subscription';
import { fetchChungyakHome } from './chungyak-home';
import { fetchLH } from './lh';
import { fetchGH, fetchIH, fetchSH } from './regional';

export async function getAllSubscriptions(): Promise<SubscriptionEvent[]> {
  // 클라이언트 사이드(브라우저)에서도 최신화를 위해 호출 허용
  console.log(`[DEBUG] Fetching subscriptions at ${new Date().toLocaleString('ko-KR')} (Client: ${typeof window !== 'undefined'})`);

  try {
    const results = await Promise.allSettled([
      fetchChungyakHome(),
      fetchLH(),
      fetchGH(),
      fetchIH(),
      fetchSH(),
    ]);

    const combined: SubscriptionEvent[] = [];
    const sourceNames = ['HOME', 'LH', 'GH', 'IH', 'SH'];

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
    return combined;
  } catch (error) {
    console.error('API Aggregation Error:', error);
    return [];
  }
}
