export type SubscriptionSource = 'LH' | 'HOME';
export type SubscriptionType = 'APT' | 'OFFICETEL' | 'CITY_HOUSE' | 'PRIVATE_RENT' | 'PRE_APT';

export interface SubscriptionEvent {
  id: string;
  title: string;
  source: SubscriptionSource;
  type: SubscriptionType;
  region: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  announcementDate: string; // YYYY-MM-DD
  url: string;
  isPremium?: boolean;
  price?: string;
  unitCount?: number;
  /** 청약홈 단지관리번호(HOUSE_MANAGE_NO). HOME 소스에만 존재, LH는 별도 식별체계라 없음. */
  complexId?: string;
  specialSupplyStart?: string; // 특별공급 접수 시작 (YYYY-MM-DD)
  specialSupplyEnd?: string;   // 특별공급 접수 종료 (YYYY-MM-DD)
  generalSupplyStart?: string; // 일반공급(1순위 해당지역 기준) 접수 시작 (YYYY-MM-DD)
  generalSupplyEnd?: string;   // 일반공급(1순위 해당지역 기준) 접수 종료 (YYYY-MM-DD)
}
