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
}
