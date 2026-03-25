import { SubscriptionEvent } from '../types/subscription';

export async function fetchChungyakHome(page = 1, perPage = 100): Promise<SubscriptionEvent[]> {
    const API_KEY = process.env.CHUNGYAK_HOME_API_KEY || process.env.NEXT_PUBLIC_PUBLIC_DATA_KEY;
    const URL = 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail';

    if (!API_KEY) {
        console.warn('[HOME] Missing API_KEY');
        return [];
    }

    try {
        const response = await fetch(
            `${URL}?page=${page}&perPage=${perPage}&serviceKey=${API_KEY}`
        );

        if (!response.ok) {
            console.error(`[HOME] API Error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const items = data.data || [];

        return items.map((item: any) => ({
            id: `home-${item.PBLANC_NO || Math.random()}`,
            title: item.HOUSE_NM || '청약홈 공고',
            source: 'HOME',
            type: 'APT',
            region: item.HSSPLY_ADRES || '',
            startDate: item.RCEPT_BGNDE || '',
            endDate: item.RCEPT_ENDDE || '',
            announcementDate: item.PBLANC_DGR || '',
            url: `https://www.applyhome.co.kr/`,
            unitCount: parseInt(item.TOT_HSSPLY_CO, 10) || 0,
        }));
    } catch (error) {
        console.error('Error fetching Chungyak Home:', error);
        return [];
    }
}
