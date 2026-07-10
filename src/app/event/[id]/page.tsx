import fs from 'fs';
import path from 'path';
import { getAllSubscriptions } from '@/lib/api';
import { SubscriptionEvent } from '@/lib/types/subscription';
import EventDetailContent from '@/components/calendar/EventDetailContent';

const EVENTS_CACHE_PATH = path.join(process.cwd(), '.next-build-cache', 'events.json');

export const dynamicParams = false;

export async function generateStaticParams() {
  const events = await getAllSubscriptions();

  if (!events || events.length === 0) {
    console.warn('!!!! [BUILD WARNING] No events found during static generation. Using skip-id.');
    return [{ id: 'skip' }];
  }

  // 빌드 중 이벤트 데이터를 파일로 저장해 Page에서 일관되게 참조합니다.
  fs.mkdirSync(path.dirname(EVENTS_CACHE_PATH), { recursive: true });
  fs.writeFileSync(EVENTS_CACHE_PATH, JSON.stringify(events), 'utf-8');

  // 2026년 이후 데이터만 생성하도록 필터링 (빌드 시간 단축 및 최신 데이터 집중)
  const currentYear = new Date().getFullYear(); // 2026
  const targetYearStr = `${currentYear}-01-01`;

  const params = events
    .filter(event => event.id && (event.startDate >= targetYearStr))
    .map((event) => ({
      id: String(event.id).replace(/[\/\s]/g, '-'),
    }));

  console.error(`!!!! [BUILD SUCCESS] Generating ${params.length} static event pages (Filtered to 2026+).`);
  return params;
}

export default async function Page({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // generateStaticParams에서 저장한 캐시를 읽어 일관성 보장
  let events: SubscriptionEvent[] = [];
  try {
    const raw = fs.readFileSync(EVENTS_CACHE_PATH, 'utf-8');
    events = JSON.parse(raw) as SubscriptionEvent[];
  } catch {
    events = await getAllSubscriptions();
  }

  // 찾을 때도 동일한 정제 로직을 적용합니다.
  const event = events.find((e) => String(e.id).replace(/[\/\s]/g, '-') === id);

  return <EventDetailContent event={event || null} />;
}
