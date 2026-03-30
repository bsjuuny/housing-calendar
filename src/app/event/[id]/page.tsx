import { getAllSubscriptions } from '@/lib/api';
import EventDetailContent from '@/components/calendar/EventDetailContent';

export const dynamicParams = false;

export async function generateStaticParams() {
  const events = await getAllSubscriptions();
  
  if (!events || events.length === 0) {
    console.warn('!!!! [BUILD WARNING] No events found during static generation. Using skip-id.');
    return [{ id: 'skip' }];
  }

  // Next.js 빌드 엔진이 슬래시(/)나 공백을 파일 경로로 오해하지 않도록 정제합니다.
  const params = events
    .filter(event => event.id)
    .map((event) => ({
      id: String(event.id).replace(/[\/\s]/g, '-'),
    }));

  console.error(`!!!! [BUILD SUCCESS] Generating ${params.length} static event pages.`);
  return params;
}

export default async function Page({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const events = await getAllSubscriptions();
  
  // 찾을 때도 동일한 정제 로직을 적용합니다.
  const event = events.find((e) => String(e.id).replace(/[\/\s]/g, '-') === id);

  return <EventDetailContent event={event || null} />;
}
