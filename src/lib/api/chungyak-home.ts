import { SubscriptionEvent } from '../types/subscription';

export async function fetchChungyakHome(page = 1, perPage = 100): Promise<SubscriptionEvent[]> {
    const API_KEY = process.env.CHUNGYAK_HOME_API_KEY || process.env.NEXT_PUBLIC_PUBLIC_DATA_KEY;
    const URL = 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail';

    if (!API_KEY) {
        console.warn('[HOME] Missing API_KEY');
        return [];
    }

    try {
        const fetchPage = async (p: number) => {
            // ODCloud (api.odcloud.kr) - Use raw API_KEY literally
            const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=${p}&perPage=${perPage}&serviceKey=${API_KEY}`;
            const resp = await fetch(url, {
                signal: AbortSignal.timeout(15000),
            });
            if (!resp.ok) return [];
            const d = await resp.json().catch(() => ({}));
            return d.data || [];
        };

        const pages = await Promise.all([
            fetchPage(1), fetchPage(2), fetchPage(3), fetchPage(4), fetchPage(5),
            fetchPage(6), fetchPage(7), fetchPage(8), fetchPage(9), fetchPage(10)
        ]);
        const items = pages.flat();
        console.error(`[HOME] ✅ Combined ${items.length} items from ODCloud deep fetch`);

        const formatDate = (raw: string) => {
            if (!raw) return '';
            const digits = raw.replace(/\D/g, '');
            if (digits.length >= 8) {
                return `${digits.substring(0, 4)}-${digits.substring(4, 6)}-${digits.substring(6, 8)}`;
            }
            return raw;
        };

        return items.map((item: any) => {
            const bgnde = item.RCEPT_BGNDE || item.rceptBgnde || item.RCR_BGNDE || '';
            const endde = item.RCEPT_ENDDE || item.rceptEndde || item.RCR_ENDDE || '';
            const dgr = item.PBLANC_DGR || item.pblancDgr || '';
            
            return {
                id: `home-${item.PBLANC_NO || item.pblancNo || Math.random()}`,
                title: item.HOUSE_NM || item.houseNm || '청약홈 공고',
                source: 'HOME',
                type: 'APT',
                region: item.HSSPLY_ADRES || item.hssplyAdres || '',
                startDate: formatDate(bgnde),
                endDate: formatDate(endde),
                announcementDate: formatDate(dgr),
                url: `https://www.applyhome.co.kr/`,
                unitCount: parseInt(item.TOT_HSSPLY_CO || item.totHssplyCo || '0', 10) || 0,
            };
        });
    } catch (error) {
        console.error('Error fetching Chungyak Home:', error);
        return [];
    }
}
