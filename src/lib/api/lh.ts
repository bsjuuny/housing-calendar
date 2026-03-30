import { SubscriptionEvent } from '../types/subscription';

const formatDate = (raw: string) => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 8) {
    return `${digits.substring(0, 4)}-${digits.substring(4, 6)}-${digits.substring(6, 8)}`;
  }
  return raw;
};

export async function fetchLH(page = 1, size = 100): Promise<SubscriptionEvent[]> {
  const LH_API_KEY = process.env.LH_API_KEY || process.env.NEXT_PUBLIC_PUBLIC_DATA_KEY;
  // B552555 서비스 엔드포인트의 '1' 제거 및 최신화
  if (!LH_API_KEY) {
    console.warn('[LH] Missing LH_API_KEY');
    return [];
  }

  try {
    const decodedKey = decodeURIComponent(LH_API_KEY);
    // 가장 최신이자 안정적인 LH 분양임대공고문 엔드포인트를 사용합니다.
    const urlObj = new URL('http://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1');
    urlObj.searchParams.set('serviceKey', decodedKey);
    urlObj.searchParams.set('PG_SZ', size.toString());
    urlObj.searchParams.set('PAGE', page.toString());
    urlObj.searchParams.set('_type', 'json');
    
    const response = await fetch(urlObj.toString(), {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No Body');
        console.error(`[LH] API Error: ${response.status} - ${errorText}`);
        return [];
    }

    const text = await response.text();
    if (text.trim().startsWith('<?xml')) {
      console.warn('[LH] Received XML. Key may not be authorized for JSON or data exists as XML only.');
      return [];
    }

    const data = JSON.parse(text);
    // LH API는 버전/엔드포인트마다 dsList 위치가 다릅니다.
    let items = [];
    if (Array.isArray(data)) {
        items = data[1]?.dsList || data[0]?.dsList || [];
    } else if (data?.dsList) {
        items = data.dsList;
    } else if (data?.items) {
        items = data.items;
    } else if (data?.row) {
        items = data.row;
    }
    
    if (items.length === 0) {
        console.warn(`[LH] No items found. Structure: ${JSON.stringify(data).substring(0, 100)}`);
    }

    return items.map((item: any) => {
      const ntDt = item.PAN_NT_DT || item.PAN_DT || '';
      const clsgDt = item.CLSG_DT || item.PAN_ED_DT || '';
      
      return {
        id: `lh-${item.PAN_ID || Math.random()}`,
        title: item.PAN_NM || 'LH 주택공고',
        source: 'LH',
        type: 'APT',
        region: item.CNP_NM || '전국',
        startDate: formatDate(ntDt),
        endDate: formatDate(clsgDt),
        announcementDate: formatDate(ntDt),
        url: `https://apply.lh.or.kr/`,
      };
    });
  } catch (error) {
    console.error('[LH] Critical Fetch Error:', error);
    return [];
  }
}
