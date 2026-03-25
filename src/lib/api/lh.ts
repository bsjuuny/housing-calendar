import { SubscriptionEvent } from '../types/subscription';

export async function fetchLH(page = 1, size = 100): Promise<SubscriptionEvent[]> {
  const LH_API_KEY = process.env.LH_API_KEY;
  // B552555 서비스 엔드포인트의 '1' 제거 및 최신화
  const LH_URL = 'https://apis.data.go.kr/B552555/lhLeaseNoticeInfo/getLeaseNoticeInfo';

  if (!LH_API_KEY) {
    console.warn('[LH] Missing LH_API_KEY');
    return [];
  }

  try {
    const decodedKey = decodeURIComponent(LH_API_KEY);
    const url = `${LH_URL}?serviceKey=${decodedKey}&PG_SZ=${size}&PAGE=${page}&_type=json`;
    const response = await fetch(url);

    if (!response.ok) {
        console.error(`[LH] API Error: ${response.status}`);
        return [];
    }

    const text = await response.text();
    
    // 만약 JSON 요청을 했음에도 XML이 반환되는 상황을 대비해 체크합니다.
    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<response')) {
      console.warn('[LH] Received XML instead of JSON. Check if API key is valid or data exists.');
      return [];
    }

    const data = JSON.parse(text);
    // LH API 특유의 응답 구조 체크 ([0]은 카운트, [1]은 데이터 리스트인 경우가 많음)
    const items = data[1]?.dsList || [];

    return items.map((item: any) => ({
      id: `lh-${item.PAN_ID || Math.random()}`,
      title: item.PAN_NM || 'LH 주택공고',
      source: 'LH',
      type: 'APT',
      region: item.CNP_NM || '전국',
      startDate: item.PAN_NT_DT || '',
      endDate: item.CLSG_DT || '',
      announcementDate: item.PAN_NT_DT || '',
      url: `https://apply.lh.or.kr/`,
    }));
  } catch (error) {
    console.error('[LH] Critical Fetch Error:', error);
    return [];
  }
}
