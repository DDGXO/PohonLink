import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  getAllLinks,
  getAllProducts,
  getPageviewCount,
  getOsBreakdown,
  getDeviceBreakdown,
  getReferrerBreakdown,
  getAnalyticsEvents,
} from '@/lib/db/queries';
import AnalyticsClient from './analytics-client';

export default async function AnalyticsPage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');

  const { user, profile } = auth;

  const [standardLinks, products, totalViews, osEntries, deviceEntries, referrerEntries, rawEvents] = await Promise.all([
    getAllLinks(user.id),
    getAllProducts(user.id),
    getPageviewCount(user.id),
    getOsBreakdown(user.id),
    getDeviceBreakdown(user.id),
    getReferrerBreakdown(user.id),
    getAnalyticsEvents(user.id, 5000),
  ]);

  const allItems = [...standardLinks, ...products];
  const totalClicks = allItems.reduce((sum, link) => sum + (link.click_count || 0), 0);

  return (
    <AnalyticsClient
      links={allItems}
      totalViews={totalViews}
      totalClicks={totalClicks}
      osEntries={osEntries}
      deviceEntries={deviceEntries}
      referrerEntries={referrerEntries}
      rawEvents={rawEvents}
      username={profile?.username || 'user'}
    />
  );
}
