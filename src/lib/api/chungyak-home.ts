import { SubscriptionEvent } from '../types/subscription';

const formatDate = (raw: string) => {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 8) {
        return `${digits.substring(0, 4)}-${digits.substring(4, 6)}-${digits.substring(6, 8)}`;
    }
    return raw;
};

const fetchPages = async (endpoint: string, API_KEY: string, pageCount: number): Promise<any[]> => {
    const fetchPage = async (p: number) => {
        const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${endpoint}?page=${p}&perPage=100&serviceKey=${API_KEY}`;
        const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!resp.ok) return [];
        const d = await resp.json().catch(() => ({}));
        return d.data || [];
    };
    const pages = await Promise.all(Array.from({ length: pageCount }, (_, i) => fetchPage(i + 1)));
    return pages.flat();
};

export async function fetchChungyakHome(): Promise<SubscriptionEvent[]> {
    const API_KEY = process.env.CHUNGYAK_HOME_API_KEY || process.env.NEXT_PUBLIC_PUBLIC_DATA_KEY;

    if (!API_KEY) {
        console.warn('[HOME] Missing API_KEY');
        return [];
    }

    try {
        // 일반 APT 청약 (총 ~2700건, 10페이지 = 1000건 커버)
        const aptItems = await fetchPages('getAPTLttotPblancDetail', API_KEY, 10);
        console.error(`[HOME] ✅ APT 일반: ${aptItems.length}건`);

        // 잔여세대/무순위 청약 (총 ~1500건, 16페이지 = 전체 커버)
        const remndrItems = await fetchPages('getRemndrLttotPblancDetail', API_KEY, 16);
        console.error(`[HOME] ✅ APT 잔여세대: ${remndrItems.length}건`);

        const aptEvents: SubscriptionEvent[] = aptItems.map((item: any) => ({
            id: `home-${item.PBLANC_NO || Math.random()}`,
            title: item.HOUSE_NM || '청약홈 공고',
            source: 'HOME',
            type: 'APT',
            region: item.HSSPLY_ADRES || '',
            startDate: formatDate(item.RCEPT_BGNDE || ''),
            endDate: formatDate(item.RCEPT_ENDDE || ''),
            announcementDate: formatDate(item.RCRIT_PBLANC_DE || ''),
            url: item.PBLANC_URL || 'https://www.applyhome.co.kr/',
            unitCount: parseInt(item.TOT_SUPLY_HSHLDCO || item.TOT_HSSPLY_CO || '0', 10) || 0,
        }));

        const remndrEvents: SubscriptionEvent[] = remndrItems.map((item: any) => {
            // 잔여세대는 특별/일반 접수일이 별도 필드로 분리됨
            const bgnde = item.SPSPLY_RCEPT_BGNDE || item.SUBSCRPT_RCEPT_BGNDE || item.GNRL_RCEPT_BGNDE || '';
            const endde = item.SPSPLY_RCEPT_ENDDE || item.SUBSCRPT_RCEPT_ENDDE || item.GNRL_RCEPT_ENDDE || '';
            return {
                id: `home-${item.PBLANC_NO || Math.random()}`,
                title: item.HOUSE_NM || '청약홈 잔여세대',
                source: 'HOME',
                type: 'APT',
                region: item.HSSPLY_ADRES || '',
                startDate: formatDate(bgnde),
                endDate: formatDate(endde),
                announcementDate: formatDate(item.RCRIT_PBLANC_DE || ''),
                url: item.PBLANC_URL || 'https://www.applyhome.co.kr/',
                unitCount: parseInt(item.TOT_SUPLY_HSHLDCO || '0', 10) || 0,
            };
        });

        const combined = [...aptEvents, ...remndrEvents];
        console.error(`[HOME] ✅ 총 ${combined.length}건 (일반 ${aptEvents.length} + 잔여세대 ${remndrEvents.length})`);
        return combined;
    } catch (error) {
        console.error('Error fetching Chungyak Home:', error);
        return [];
    }
}
