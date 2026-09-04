'use client';

import { useState, useMemo } from 'react';
import type { Link as LinkItem, AnalyticsEvent } from '@/types/database';

interface Props {
  links: LinkItem[];
  totalViews: number;
  totalClicks: number;
  osEntries: [string, number][];
  deviceEntries: [string, number][];
  referrerEntries: [string, number][];
  rawEvents: AnalyticsEvent[];
  username: string;
}

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
type ChartMode = 'both' | 'views' | 'clicks';
type LinkSortField = 'clicks' | 'ctr' | 'title';

const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  US: { name: 'Amerika Serikat', flag: '🇺🇸' },
  SG: { name: 'Singapura', flag: '🇸🇬' },
  MY: { name: 'Malaysia', flag: '🇲🇾' },
  JP: { name: 'Jepang', flag: '🇯🇵' },
  GB: { name: 'Inggris Raya', flag: '🇬🇧' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  DE: { name: 'Jerman', flag: '🇩🇪' },
  NL: { name: 'Belanda', flag: '🇳🇱' },
  KR: { name: 'Korea Selatan', flag: '🇰🇷' },
  TH: { name: 'Thailand', flag: '🇹🇭' },
  PH: { name: 'Filipina', flag: '🇵🇭' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  IN: { name: 'India', flag: '🇮🇳' },
  CA: { name: 'Kanada', flag: '🇨🇦' },
  BR: { name: 'Brasil', flag: '🇧🇷' },
  FR: { name: 'Prancis', flag: '🇫🇷' },
  RU: { name: 'Rusia', flag: '🇷🇺' },
  CN: { name: 'Tiongkok', flag: '🇨🇳' },
  HK: { name: 'Hong Kong', flag: '🇭🇰' },
  TW: { name: 'Taiwan', flag: '🇹🇼' },
};

function parseUtmParams(refererStr: string | null) {
  if (!refererStr) return null;
  try {
    let search = '';
    if (refererStr.startsWith('?') || refererStr.startsWith('&')) {
      search = refererStr;
    } else if (refererStr.includes('?')) {
      search = refererStr.substring(refererStr.indexOf('?'));
    } else if (refererStr.includes('utm_')) {
      search = `?${refererStr}`;
    } else {
      return null;
    }
    const params = new URLSearchParams(search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    const content = params.get('utm_content');
    const term = params.get('utm_term');

    if (source || medium || campaign) {
      return {
        source: source || 'unknown',
        medium: medium || 'unknown',
        campaign: campaign || '(tanpa nama)',
        content: content || '',
        term: term || '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

function classifyChannel(refererStr: string | null): { category: 'social' | 'search' | 'direct' | 'referral'; name: string; icon: string } {
  if (!refererStr || refererStr === '' || refererStr.includes('localhost') || refererStr.includes('pohonlink.id')) {
    return { category: 'direct', name: 'Langsung / Direct', icon: '🌐' };
  }
  const lower = refererStr.toLowerCase();
  if (lower.includes('instagram.com')) return { category: 'social', name: 'Instagram', icon: '📸' };
  if (lower.includes('tiktok.com')) return { category: 'social', name: 'TikTok', icon: '🎵' };
  if (lower.includes('t.co') || lower.includes('twitter.com') || lower.includes('x.com')) return { category: 'social', name: 'X / Twitter', icon: '🐦' };
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { category: 'social', name: 'YouTube', icon: '▶️' };
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return { category: 'social', name: 'WhatsApp', icon: '💬' };
  if (lower.includes('facebook.com') || lower.includes('fb.me')) return { category: 'social', name: 'Facebook', icon: '👤' };
  if (lower.includes('t.me') || lower.includes('telegram')) return { category: 'social', name: 'Telegram', icon: '✈️' };
  if (lower.includes('threads.net')) return { category: 'social', name: 'Threads', icon: '🧵' };
  if (lower.includes('linkedin.com')) return { category: 'social', name: 'LinkedIn', icon: '💼' };
  if (lower.includes('pinterest.com')) return { category: 'social', name: 'Pinterest', icon: '📌' };

  if (lower.includes('google.com') || lower.includes('google.co.id')) return { category: 'search', name: 'Google Search', icon: '🔍' };
  if (lower.includes('bing.com')) return { category: 'search', name: 'Bing', icon: '🔍' };
  if (lower.includes('yahoo.com')) return { category: 'search', name: 'Yahoo', icon: '🔍' };
  if (lower.includes('duckduckgo.com')) return { category: 'search', name: 'DuckDuckGo', icon: '🦆' };

  try {
    const host = new URL(refererStr.startsWith('http') ? refererStr : `https://${refererStr}`).hostname;
    return { category: 'referral', name: host.replace(/^www\./, ''), icon: '🔗' };
  } catch {
    return { category: 'referral', name: 'Web Lainnya', icon: '🔗' };
  }
}

export default function AnalyticsClient({
  links,
  totalViews: initialTotalViews,
  totalClicks: initialTotalClicks,
  rawEvents,
  username,
}: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartMode, setChartMode] = useState<ChartMode>('both');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; views: number; clicks: number; x: number; y: number } | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [linkSearch, setLinkSearch] = useState('');
  const [linkSort, setLinkSort] = useState<LinkSortField>('clicks');

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiInsightsLoading, setIsAiInsightsLoading] = useState(false);

  // 1. FILTER EVENTS BY DATE RANGE
  const { filteredEvents } = useMemo(() => {
    const now = Date.now();
    let cutoff = 0;
    if (timeRange === '24h') cutoff = now - 24 * 60 * 60 * 1000;
    else if (timeRange === '7d') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (timeRange === '30d') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    else if (timeRange === '90d') cutoff = now - 90 * 24 * 60 * 60 * 1000;

    const filtered = cutoff > 0
      ? rawEvents.filter(e => new Date(e.created_at).getTime() >= cutoff)
      : rawEvents;

    return { filteredEvents: filtered };
  }, [rawEvents, timeRange]);

  // Separate views and clicks
  const periodViewsEvents = useMemo(() => filteredEvents.filter(e => e.event === 'pageview'), [filteredEvents]);
  const periodClicksEvents = useMemo(() => filteredEvents.filter(e => e.event === 'click'), [filteredEvents]);

  // Metrics
  const periodViewsCount = timeRange === 'all' ? Math.max(initialTotalViews, periodViewsEvents.length) : periodViewsEvents.length;
  const periodClicksCount = timeRange === 'all' ? Math.max(initialTotalClicks, periodClicksEvents.length) : periodClicksEvents.length;

  // 3. UNIQUE VISITORS METRIC
  const uniqueVisitorsCount = useMemo(() => {
    const set = new Set<string>();
    for (const event of periodViewsEvents) {
      if (event.ip_hash) set.add(event.ip_hash);
      else if (event.id) set.add(event.id);
    }
    return set.size;
  }, [periodViewsEvents]);

  const uniquePercent = periodViewsCount > 0 ? ((uniqueVisitorsCount / periodViewsCount) * 100).toFixed(0) : '0';
  const repeatViewsCount = Math.max(0, periodViewsCount - uniqueVisitorsCount);

  // CTR
  const periodCtr = periodViewsCount > 0 ? ((periodClicksCount / periodViewsCount) * 100).toFixed(1) : '0.0';

  // 2. TIME-SERIES DAILY / HOURLY CHART DATA
  const timeSeriesData = useMemo(() => {
    const now = new Date();

    if (timeRange === '24h') {
      const hoursMap: Record<number, { label: string; views: number; clicks: number }> = {};
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600 * 1000);
        const h = d.getHours();
        const label = `${String(h).padStart(2, '0')}:00`;
        hoursMap[h] = { label, views: 0, clicks: 0 };
      }
      for (const e of filteredEvents) {
        const h = new Date(e.created_at).getHours();
        if (hoursMap[h]) {
          if (e.event === 'pageview') hoursMap[h].views++;
          else if (e.event === 'click') hoursMap[h].clicks++;
        }
      }
      return Object.values(hoursMap);
    }

    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 14;
    const daysMap: Record<string, { label: string; fullDate: string; views: number; clicks: number }> = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const key = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      daysMap[key] = { label: dayName, fullDate: key, views: 0, clicks: 0 };
    }

    for (const e of filteredEvents) {
      const key = e.created_at.slice(0, 10);
      if (daysMap[key]) {
        if (e.event === 'pageview') daysMap[key].views++;
        else if (e.event === 'click') daysMap[key].clicks++;
      } else if (timeRange === 'all') {
        const d = new Date(e.created_at);
        const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        daysMap[key] = { label: dayName, fullDate: key, views: e.event === 'pageview' ? 1 : 0, clicks: e.event === 'click' ? 1 : 0 };
      }
    }

    return Object.values(daysMap);
  }, [filteredEvents, timeRange]);

  const maxChartVal = useMemo(() => {
    let max = 1;
    for (const d of timeSeriesData) {
      if (d.views > max) max = d.views;
      if (d.clicks > max) max = d.clicks;
    }
    return Math.max(max, 5);
  }, [timeSeriesData]);

  const peakDay = useMemo(() => {
    if (timeSeriesData.length === 0) return null;
    return [...timeSeriesData].sort((a, b) => b.views - a.views)[0];
  }, [timeSeriesData]);

  // 4. INDIVIDUAL LINK CTR & CONVERSION TABLE
  const linkPerformanceList = useMemo(() => {
    const linkClicksMap: Record<string, number> = {};
    for (const e of periodClicksEvents) {
      if (e.link_id) {
        linkClicksMap[e.link_id] = (linkClicksMap[e.link_id] || 0) + 1;
      }
    }

    const items = links.map(link => {
      const meta = link.custom_css as Record<string, unknown> | null;
      const isProduct = Boolean(meta?.is_product);
      const count = timeRange === 'all'
        ? Math.max(linkClicksMap[link.id] || 0, link.click_count || 0)
        : (linkClicksMap[link.id] || 0);

      const linkCtr = periodViewsCount > 0 ? ((count / periodViewsCount) * 100).toFixed(1) : '0.0';
      const linkShare = periodClicksCount > 0 ? ((count / periodClicksCount) * 100).toFixed(1) : '0.0';

      return {
        id: link.id,
        title: link.title || '(Tanpa Judul)',
        url: link.url || '#',
        is_active: link.is_active,
        is_pinned: link.is_pinned,
        is_product: isProduct,
        clicks: count,
        ctr: parseFloat(linkCtr),
        ctrString: linkCtr,
        shareString: linkShare,
      };
    });

    let filtered = items;
    if (linkSearch.trim()) {
      const q = linkSearch.toLowerCase();
      filtered = items.filter(l => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
    }

    if (linkSort === 'clicks') filtered.sort((a, b) => b.clicks - a.clicks);
    else if (linkSort === 'ctr') filtered.sort((a, b) => b.ctr - a.ctr);
    else if (linkSort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));

    return filtered;
  }, [links, periodClicksEvents, periodViewsCount, periodClicksCount, timeRange, linkSearch, linkSort]);

  // 5. GEOLOCATION / COUNTRY BREAKDOWN
  const countryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of periodViewsEvents) {
      const code = (e.country || 'ID').toUpperCase();
      counts[code] = (counts[code] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([code, count]) => {
        const info = COUNTRY_MAP[code] || { name: code, flag: '🌐' };
        const pct = periodViewsCount > 0 ? ((count / periodViewsCount) * 100).toFixed(1) : '0.0';
        return { code, name: info.name, flag: info.flag, count, pct };
      })
      .sort((a, b) => b.count - a.count);
  }, [periodViewsEvents, periodViewsCount]);

  // 6. UTM CAMPAIGN PERFORMANCE TRACKER
  const utmCampaignList = useMemo(() => {
    const map: Record<string, { campaign: string; source: string; medium: string; views: number; clicks: number }> = {};

    for (const e of filteredEvents) {
      const parsed = parseUtmParams(e.referer);
      if (parsed) {
        const key = `${parsed.campaign}__${parsed.source}__${parsed.medium}`;
        if (!map[key]) {
          map[key] = {
            campaign: parsed.campaign,
            source: parsed.source,
            medium: parsed.medium,
            views: 0,
            clicks: 0,
          };
        }
        if (e.event === 'pageview') map[key].views++;
        else if (e.event === 'click') map[key].clicks++;
      }
    }

    return Object.values(map)
      .map(item => {
        const ctrVal = item.views > 0 ? ((item.clicks / item.views) * 100).toFixed(1) : '0.0';
        return { ...item, ctr: ctrVal };
      })
      .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks));
  }, [filteredEvents]);

  // 7. PEAK TRAFFIC HOURS & BEST TIME TO POST
  const { hourlyDistribution, peakHourLabel, peakDayName } = useMemo(() => {
    const hours: number[] = new Array(24).fill(0);
    const days: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    for (const e of periodViewsEvents) {
      const d = new Date(e.created_at);
      const h = d.getHours();
      const day = d.getDay();
      hours[h] = (hours[h] || 0) + 1;
      days[day] = (days[day] || 0) + 1;
    }

    let maxH = 0;
    let maxHVal = 0;
    for (let i = 0; i < 24; i++) {
      if (hours[i] > maxHVal) {
        maxHVal = hours[i];
        maxH = i;
      }
    }

    let maxDay = 0;
    let maxDayVal = 0;
    for (let i = 0; i < 7; i++) {
      if (days[i] > maxDayVal) {
        maxDayVal = days[i];
        maxDay = i;
      }
    }

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const pDay = maxDayVal > 0 ? dayNames[maxDay] : 'Hari Kerja';
    const pHour = `${String(maxH).padStart(2, '0')}:00 - ${String((maxH + 1) % 24).padStart(2, '0')}:00 WIB`;

    return {
      hourlyDistribution: hours,
      peakHourLabel: pHour,
      peakDayName: pDay,
    };
  }, [periodViewsEvents]);

  // 8. TRAFFIC CHANNEL BUCKETS
  const { channelBuckets, osBreakdownList, deviceBreakdownList } = useMemo(() => {
    const buckets: Record<'social' | 'search' | 'direct' | 'referral', { count: number; sources: Record<string, number> }> = {
      social: { count: 0, sources: {} },
      search: { count: 0, sources: {} },
      direct: { count: 0, sources: {} },
      referral: { count: 0, sources: {} },
    };

    const osMap: Record<string, number> = {};
    const devMap: Record<string, number> = {};

    for (const e of periodViewsEvents) {
      const { category, name } = classifyChannel(e.referer);
      buckets[category].count++;
      buckets[category].sources[name] = (buckets[category].sources[name] || 0) + 1;

      const os = e.os || 'Lainnya';
      osMap[os] = (osMap[os] || 0) + 1;

      const dev = e.device || 'desktop';
      const devLabel = dev === 'mobile' ? '📱 Mobile' : dev === 'tablet' ? '📟 Tablet' : '💻 Desktop';
      devMap[devLabel] = (devMap[devLabel] || 0) + 1;
    }

    return {
      channelBuckets: buckets,
      osBreakdownList: Object.entries(osMap).sort((a, b) => b[1] - a[1]),
      deviceBreakdownList: Object.entries(devMap).sort((a, b) => b[1] - a[1]),
    };
  }, [periodViewsEvents]);

  // Export handlers
  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      setDownloadMsg('Belum ada data event di rentang waktu ini');
      setTimeout(() => setDownloadMsg(null), 3000);
      return;
    }

    const headers = ['ID', 'Event', 'Link_ID', 'Country', 'OS', 'Device', 'IP_Hash', 'Referer', 'Created_At'];
    const rows = filteredEvents.map(e => [
      `"${e.id}"`,
      `"${e.event}"`,
      `"${e.link_id || ''}"`,
      `"${e.country || 'ID'}"`,
      `"${e.os || '-'}"`,
      `"${e.device || '-'}"`,
      `"${e.ip_hash || '-'}"`,
      `"${e.referer ? e.referer.replace(/"/g, '""') : '-'}"`,
      `"${new Date(e.created_at).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pohonlink-analytics-${username}-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadMsg('Laporan CSV berhasil diunduh!');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const handleExportJSON = () => {
    if (filteredEvents.length === 0) {
      setDownloadMsg('Belum ada data event di rentang waktu ini');
      setTimeout(() => setDownloadMsg(null), 3000);
      return;
    }

    const payload = {
      username,
      time_range: timeRange,
      exported_at: new Date().toISOString(),
      summary: {
        total_views: periodViewsCount,
        unique_visitors: uniqueVisitorsCount,
        total_clicks: periodClicksCount,
        ctr: `${periodCtr}%`,
      },
      links: linkPerformanceList,
      countries: countryBreakdown,
      utm_campaigns: utmCampaignList,
      peak_hours: { peak_hour: peakHourLabel, peak_day: peakDayName },
      channels: channelBuckets,
      events: filteredEvents,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `pohonlink-analytics-${username}-${timeRange}-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadMsg('Laporan JSON berhasil diunduh!');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const handleFetchAiInsights = async () => {
    setIsAiInsightsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insights',
          stats: {
            timeRange,
            totalViews: periodViewsCount,
            uniqueVisitors: uniqueVisitorsCount,
            totalClicks: periodClicksCount,
            ctr: parseFloat(periodCtr),
            peakHour: peakHourLabel,
            peakDay: peakDayName,
            topCountries: countryBreakdown.slice(0, 3).map(c => `${c.name} (${c.count})`),
            topLinks: linkPerformanceList.slice(0, 5).map(l => ({ title: l.title, clicks: l.clicks, ctr: `${l.ctrString}%` })),
          },
        }),
      });
      const data = await res.json();
      if (data?.insights) {
        setAiInsights(data.insights);
      }
    } catch {
      setDownloadMsg('Gagal mendapatkan analisis AI');
    } finally {
      setIsAiInsightsLoading(false);
    }
  };

  const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: '24h', label: '24 Jam' },
    { id: '7d', label: '7 Hari' },
    { id: '30d', label: '30 Hari' },
    { id: '90d', label: '90 Hari' },
    { id: 'all', label: 'Semua Waktu' },
  ];

  const maxHourlyVal = Math.max(...hourlyDistribution, 1);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Analitik & Statistik</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Pantau trafik real-time, tingkat konversi, dan performa setiap tautan
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleFetchAiInsights}
            disabled={isAiInsightsLoading}
            style={{
              padding: '8px 14px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isAiInsightsLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isAiInsightsLoading ? 'Menganalisis...' : '✨ Analisis AI'}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📥 Unduh CSV
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            style={{
              padding: '8px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📥 Unduh JSON
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 14px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>Rentang Waktu:</span>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {timeRangeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeRange(opt.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: timeRange === opt.id ? 700 : 500,
                  background: timeRange === opt.id ? 'var(--accent)' : 'transparent',
                  color: timeRange === opt.id ? '#000' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          {filteredEvents.length} event tercatat
        </div>
      </div>

      {/* AI Insights Display */}
      {aiInsights && (
        <div style={{
          background: 'rgba(125,249,182,0.06)',
          border: '1px solid var(--accent, #7DF9B6)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Rekomendasi Pertumbuhan AI ({timeRange.toUpperCase()})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setAiInsights(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '16px', cursor: 'pointer' }}
            >
              x
            </button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {aiInsights}
          </div>
        </div>
      )}

      {downloadMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px',
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: 'var(--accent)',
        }}>
          v {downloadMsg}
        </div>
      )}

      {/* 3. METRIC CARDS (VIEWS, UNIQUE VISITORS, CLICKS, CTR) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Pageviews */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Views</span>
            <span style={{ fontSize: '18px' }}>👁️</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{periodViewsCount.toLocaleString()}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', margin: 0 }}>Total pembukaan halaman</p>
        </div>

        {/* Unique Visitors */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pengunjung Unik</span>
            <span style={{ fontSize: '18px' }}>👤</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#38bdf8', margin: 0 }}>{uniqueVisitorsCount.toLocaleString()}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', margin: 0 }}>
            {uniquePercent}% pengunjung baru • {repeatViewsCount} berulang
          </p>
        </div>

        {/* Total Clicks */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Klik Link</span>
            <span style={{ fontSize: '18px' }}>↗️</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{periodClicksCount.toLocaleString()}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', margin: 0 }}>Aksi klik pada semua tombol</p>
        </div>

        {/* Average CTR */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Rata-rata CTR</span>
            <span style={{ fontSize: '18px' }}>📊</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#a78bfa', margin: 0 }}>{periodCtr}%</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', margin: 0 }}>Rasio klik dibanding kunjungan</p>
        </div>
      </div>

      {/* 2. TIME-SERIES VISUAL CHART (DAILY VIEWS VS CLICKS) */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              📈 Grafik Tren Trafik ({timeRange === '24h' ? 'Per Jam' : 'Harian'})
            </h2>
            {peakDay && peakDay.views > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px', margin: 0 }}>
                Puncak tertinggi: <strong style={{ color: 'var(--accent)' }}>{peakDay.label}</strong> ({peakDay.views} Views, {peakDay.clicks} Klik)
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setChartMode('both')}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: chartMode === 'both' ? 'var(--accent)' : 'var(--bg)',
                color: chartMode === 'both' ? '#000' : 'var(--text-dim)',
              }}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setChartMode('views')}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: chartMode === 'views' ? '#38bdf8' : 'var(--bg)',
                color: chartMode === 'views' ? '#000' : 'var(--text-dim)',
              }}
            >
              👁️ Views
            </button>
            <button
              type="button"
              onClick={() => setChartMode('clicks')}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: chartMode === 'clicks' ? 'var(--accent)' : 'var(--bg)',
                color: chartMode === 'clicks' ? '#000' : 'var(--text-dim)',
              }}
            >
              ↗️ Klik
            </button>
          </div>
        </div>

        {/* Visual Chart Container */}
        <div style={{ position: 'relative', width: '100%', height: '220px', paddingTop: '10px' }}>
          {/* SVG Grid Lines */}
          <svg style={{ width: '100%', height: '180px', overflow: 'visible' }}>
            <line x1="0" y1="0" x2="100%" y2="0" stroke="var(--border)" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2="100%" y2="45" stroke="var(--border)" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="100%" y2="90" stroke="var(--border)" strokeDasharray="3 3" />
            <line x1="0" y1="135" x2="100%" y2="135" stroke="var(--border)" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="100%" y2="180" stroke="var(--border)" />
          </svg>

          {/* Bar Columns */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '180px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: timeSeriesData.length > 20 ? '2px' : '6px',
            padding: '0 8px',
          }}>
            {timeSeriesData.map((d, idx) => {
              const viewsHeight = Math.max(4, Math.round((d.views / maxChartVal) * 160));
              const clicksHeight = Math.max(4, Math.round((d.clicks / maxChartVal) * 160));
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredPoint({ label: d.label, views: d.views, clicks: d.clicks, x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {(chartMode === 'both' || chartMode === 'views') && (
                    <div
                      style={{
                        flex: 1,
                        maxWidth: '14px',
                        height: `${d.views > 0 ? viewsHeight : 3}px`,
                        background: d.views > 0 ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  )}
                  {(chartMode === 'both' || chartMode === 'clicks') && (
                    <div
                      style={{
                        flex: 1,
                        maxWidth: '14px',
                        height: `${d.clicks > 0 ? clicksHeight : 3}px`,
                        background: d.clicks > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            padding: '0 8px',
            fontSize: '10px',
            color: 'var(--text-dim)',
          }}>
            {timeSeriesData.filter((_, i) => i === 0 || i === Math.floor(timeSeriesData.length / 2) || i === timeSeriesData.length - 1).map((item, idx) => (
              <span key={idx}>{item.label}</span>
            ))}
          </div>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: 'fixed',
                top: `${hoveredPoint.y - 65}px`,
                left: `${hoveredPoint.x}px`,
                transform: 'translateX(-50%)',
                background: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                color: 'var(--text)',
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--accent)' }}>{hoveredPoint.label}</div>
              <div>👁️ {hoveredPoint.views} Views • ↗️ {hoveredPoint.clicks} Klik</div>
            </div>
          )}
        </div>
      </div>

      {/* 4. INDIVIDUAL LINK CTR & CONVERSION TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              🔗 Performa & CTR per Tautan
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px', margin: 0 }}>
              Metrik detail jumlah klik dan konversi click-through rate setiap tombol tautan
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Cari tautan..."
              value={linkSearch}
              onChange={(e) => setLinkSearch(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <select
              value={linkSort}
              onChange={(e) => setLinkSort(e.target.value as LinkSortField)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="clicks">Urutkan: Terbanyak Klik</option>
              <option value="ctr">Urutkan: CTR Tertinggi</option>
              <option value="title">Urutkan: Judul (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Link CTR Table */}
        {linkPerformanceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)', fontSize: '13px' }}>
            Belum ada data klik tautan pada periode ini
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Tautan</th>
                  <th style={{ padding: '10px 12px' }}>Tipe</th>
                  <th style={{ padding: '10px 12px' }}>Total Klik</th>
                  <th style={{ padding: '10px 12px' }}>CTR (% Views)</th>
                  <th style={{ padding: '10px 12px' }}>Share Klik</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {linkPerformanceList.map((link) => (
                  <tr key={link.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}>
                    <td style={{ padding: '12px', maxWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {link.is_pinned && <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>PIN</span>}
                        <span style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link.url}
                      </p>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {link.is_product ? '🛍️ Produk' : '🔗 Tautan'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: 'var(--accent)', fontSize: '13px' }}>{link.clicks}</strong>
                        <div style={{ width: '60px', height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, Math.max(4, link.clicks > 0 ? (link.clicks / (periodClicksCount || 1)) * 100 : 0))}%`, background: 'var(--accent)' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 600 }}>
                      {link.ctrString}%
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {link.shareString}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: link.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                        color: link.is_active ? 'var(--accent)' : 'var(--text-dim)',
                        fontWeight: 600,
                      }}>
                        {link.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5, 6, 7 GRID (COUNTRIES, UTM TRACKER, PEAK HOURS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* 5. Geolocation / Country Breakdown */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>
            🌍 Sebaran Negara Pengunjung
          </h3>
          {countryBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>Belum ada data negara tercatat</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {countryBreakdown.slice(0, 7).map((c) => (
                <div key={c.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                      {c.flag} {c.name}
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>{c.count} views ({c.pct}%)</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(4, parseFloat(c.pct))}%`, background: '#38bdf8', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. Peak Traffic Hours & Best Time to Post */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              ⏰ Waktu Trafik Puncak
            </h3>
            <span style={{ fontSize: '11px', background: 'rgba(125,249,182,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
              Optimal
            </span>
          </div>

          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '14px',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 0 2px' }}>Rekomendasi Waktu Posting Terbaik:</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>
              {peakDayName}, pukul {peakHourLabel}
            </p>
          </div>

          {/* 24h mini bar chart */}
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>Distribusi 24 Jam (00:00 - 23:00 WIB):</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '60px', padding: '4px 0' }}>
            {hourlyDistribution.map((cnt, h) => {
              const hPct = Math.round((cnt / maxHourlyVal) * 100);
              const isPeak = cnt === maxHourlyVal && cnt > 0;
              return (
                <div
                  key={h}
                  title={`${String(h).padStart(2, '0')}:00 - ${cnt} views`}
                  style={{
                    flex: 1,
                    height: `${Math.max(4, hPct)}%`,
                    background: isPeak ? 'var(--accent)' : cnt > 0 ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                    borderRadius: '2px 2px 0 0',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-dim)', marginTop: '4px' }}>
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>

      {/* 6. UTM CAMPAIGN PERFORMANCE TRACKER */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              🎯 Laporan Kampanye UTM
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px', margin: 0 }}>
              Pelacakan hasil promosi dari parameter utm_source, utm_medium, dan utm_campaign
            </p>
          </div>
        </div>

        {utmCampaignList.length === 0 ? (
          <div style={{
            background: 'var(--bg)',
            border: '1px dashed var(--border)',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 4px' }}>
              Belum ada kunjungan dengan parameter UTM pada periode ini
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '0 0 12px' }}>
              Gunakan generator UTM di pengaturan link kamu (contoh: <code>?utm_source=instagram&utm_medium=bio</code>) untuk melacak efektivitas tiap channel kampanye.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Nama Kampanye</th>
                  <th style={{ padding: '10px 12px' }}>Sumber (Source)</th>
                  <th style={{ padding: '10px 12px' }}>Media (Medium)</th>
                  <th style={{ padding: '10px 12px' }}>Views</th>
                  <th style={{ padding: '10px 12px' }}>Klik</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Konversi CTR</th>
                </tr>
              </thead>
              <tbody>
                {utmCampaignList.map((utm, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text)' }}>
                      🏷️ {utm.campaign}
                    </td>
                    <td style={{ padding: '12px', color: '#38bdf8' }}>{utm.source}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{utm.medium}</td>
                    <td style={{ padding: '12px', color: 'var(--text)' }}>{utm.views}</td>
                    <td style={{ padding: '12px', color: 'var(--accent)', fontWeight: 700 }}>{utm.clicks}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                      {utm.ctr}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. TRAFFIC CHANNELS BUCKETS & DEVICES / OS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Channel Buckets */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>
            📊 Kategori Kanal Trafik
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Media Sosial', icon: '📱', data: channelBuckets.social, color: '#38bdf8' },
              { label: 'Mesin Pencari', icon: '🔍', data: channelBuckets.search, color: 'var(--accent)' },
              { label: 'Kunjungan Langsung', icon: '🌐', data: channelBuckets.direct, color: '#a78bfa' },
              { label: 'Rujukan Web Lain', icon: '🔗', data: channelBuckets.referral, color: '#f59e0b' },
            ].map((ch) => {
              const pct = periodViewsCount > 0 ? Math.round((ch.data.count / periodViewsCount) * 100) : 0;
              return (
                <div key={ch.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ch.icon} {ch.label}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{ch.data.count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ height: '100%', width: `${Math.max(4, pct)}%`, background: ch.color, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Devices */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>
            📱 Tipe Perangkat
          </h3>
          {deviceBreakdownList.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>Belum ada data perangkat</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deviceBreakdownList.map(([dev, count]) => {
                const pct = periodViewsCount > 0 ? Math.round((count / periodViewsCount) * 100) : 0;
                return (
                  <div key={dev}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{dev}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(4, pct)}%`, background: 'var(--accent)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operating Systems */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>
            💻 Sistem Operasi
          </h3>
          {osBreakdownList.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>Belum ada data sistem operasi</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {osBreakdownList.map(([os, count]) => {
                const pct = periodViewsCount > 0 ? Math.round((count / periodViewsCount) * 100) : 0;
                return (
                  <div key={os}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{os}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(4, pct)}%`, background: '#a78bfa', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
