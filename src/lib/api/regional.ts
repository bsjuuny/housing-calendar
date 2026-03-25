import { SubscriptionEvent } from '../types/subscription';

/**
 * GH (경기주택도시공사_GH주택청약 공급정보)
 * https://www.data.go.kr/data/15099301/openapi.do
 * Endpoint: GHHousSbsmSpplyInfo
 */
export async function fetchGH(): Promise<SubscriptionEvent[]> {
  const KEY = process.env.GH_API_KEY;
  if (!KEY) {
    console.warn('[GH] Missing API_KEY');
    return [];
  }

  try {
    const decodedKey = decodeURIComponent(KEY);
    const url = `https://openapi.gg.go.kr/GHHousSbsmSpplyInfo?KEY=${decodedKey}&Type=json&pIndex=1&pSize=100`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[GH] API Error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const rows = data.GHHousSbsmSpplyInfo?.[1]?.row || [];

    return rows.map((item: any) => ({
      id: `gh-${item.BSNS_CODE || Math.random()}`,
      title: item.HOUSE_NM || 'GH 주택공고',
      source: 'GH',
      type: 'APT',
      region: item.SIGUN_NM || '경기도',
      startDate: item.SBSM_RCEPT_BGNDE || '',
      endDate: item.SBSM_RCEPT_ENDDE || '',
      announcementDate: item.PBLANC_DE || '',
      url: 'https://apply.gh.or.kr/',
      unitCount: parseInt(item.TOT_HSSPLY_CO, 10) || 0,
    }));
  } catch (e) {
    console.error('[GH] Fetch Error:', e);
    return [];
  }
}

/**
 * iH (인천도시공사_분양임대 관련 공고문 조회 서비스)
 * https://www.data.go.kr/data/15049580/openapi.do
 * Endpoint: getLttotRentAnncList
 */
export async function fetchIH(): Promise<SubscriptionEvent[]> {
  const KEY = process.env.IH_API_KEY; // 서비스 키
  if (!KEY) {
    console.warn('[IH] Missing API_KEY');
    return [];
  }

  try {
    const decodedKey = decodeURIComponent(KEY);
    const url = `https://apis.data.go.kr/B551221/LttotRentAnncSvc/getLttotRentAnncList?serviceKey=${decodedKey}&numOfRows=100&pageNo=1&_type=json`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[IH] API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];
    
    // iH API의 경우 항목이 하나일 때 객체로 올 수 있으므로 배열 처리
    const itemList = Array.isArray(items) ? items : [items];

    return itemList.filter(item => item && item.anncTitle).map((item: any) => ({
      id: `ih-${item.anncNo || Math.random()}`,
      title: item.anncTitle || 'iH 주택공고',
      source: 'IH',
      type: 'APT',
      region: '인천광역시',
      startDate: item.anncDt || '', // iH는 상세 날짜를 위해 별도 API 호출이 필요할 수 있으나 공고일로 우선 대체
      endDate: item.anncDt || '',
      announcementDate: item.anncDt || '',
      url: 'https://www.ih.co.kr/',
    }));
  } catch (e) {
    console.error('IH Fetch Error:', e);
    return [];
  }
}

/**
 * SH (서울주택도시공사) - 전용 API 대신 청약홈 필터링 권장
 * 하지만 서울열린데이터광장의 RentHouseInfo가 있다면 사용 가능
 */
export async function fetchSH(): Promise<SubscriptionEvent[]> {
  const KEY = process.env.SH_API_KEY;
  if (!KEY) {
    console.warn('[SH] Missing API_KEY');
    return [];
  }

  try {
    const url = `http://openapi.seoul.go.kr:8088/${KEY}/json/RentHouseInfo/1/20/`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return [];

    const data = await response.json();
    const rows = data.RentHouseInfo?.row || [];

    return rows.map((item: any) => ({
      id: `sh-${item.RENT_CASE_ID || Math.random()}`,
      title: item.RENT_CASE_NM || 'SH 주택공고',
      source: 'SH',
      type: 'APT',
      region: '서울특별시',
      startDate: item.PR_POST_DATE || '',
      endDate: item.PR_POST_DATE || '',
      announcementDate: item.PR_POST_DATE || '',
      url: 'https://www.i-sh.co.kr/',
    }));
  } catch (e) {
    return [];
  }
}
