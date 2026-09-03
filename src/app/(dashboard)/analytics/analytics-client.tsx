'use client';

import { useState } from 'react';
import type { Link, AnalyticsEvent } from '@/types/database';

interface Props {
  links: Link[];
  totalViews: number;
  totalClicks: number;
  osEntries: [string, number][];
  deviceEntries: [string, number][];
  referrerEntries: [string, number][];
  rawEvents: AnalyticsEvent[];
  username: string;
}

export default function AnalyticsClient({
  links,
  totalViews,
  totalClicks,
  osEntries,
  deviceEntries,
  referrerEntries,
  rawEvents,
  username,
}: Props) {
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
  const topLinks = [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 8);

  const handleExportCSV = () => {
    if (rawEvents.length === 0) {
      setDownloadMsg('Belum ada data event untuk diekspor');
      setTimeout(() => setDownloadMsg(null), 3000);
      return;
    }

    const headers = ['ID', 'Event', 'OS', 'Device', 'Referer', 'Created At'];
    const rows = rawEvents.map(e => [
      `"${e.id}"`,
      `"${e.event}"`,
      `"${e.os || '-'}"`,
      `"${e.device || '-'}"`,
      `"${e.referer ? e.referer.replace(/"/g, '""') : '-'}"`,
      `"${new Date(e.created_at).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pohonlink-analytics-${username}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadMsg('Laporan CSV berhasil diunduh!');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const handleExportJSON = () => {
    if (rawEvents.length === 0) {
      setDownloadMsg('Belum ada data event untuk diekspor');
      setTimeout(() => setDownloadMsg(null), 3000);
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({
      username,
      exported_at: new Date().toISOString(),
      summary: { totalViews, totalClicks, ctr: `${ctr}%` },
      topLinks: topLinks.map(l => ({ title: l.title, url: l.url, clicks: l.click_count })),
      referrers: referrerEntries,
      devices: deviceEntries,
      os: osEntries,
      events: rawEvents,
    }, null, 2))}`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `pohonlink-analytics-${username}-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadMsg('Laporan JSON berhasil diunduh!');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const statCards = [
    { label: 'Total Kunjungan (Views)', value: totalViews.toLocaleString(), icon: '👁️', color: 'var(--text)' },
    { label: 'Total Klik Link', value: totalClicks.toLocaleString(), icon: '↗️', color: 'var(--accent)' },
    { label: 'Rata-rata CTR (Click Rate)', value: `${ctr}%`, icon: '📊', color: '#38bdf8' },
    { label: 'Link Aktif', value: links.filter(l => l.is_active).length.toString(), icon: '🔗', color: '#a78bfa' },
  ];

  return (
    <div>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Analitik & Statistik</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>Pantau performa traffic dan konversi halaman profilmu</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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

      {downloadMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px',
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: 'var(--accent)',
        }}>
          ✓ {downloadMsg}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{card.label}</span>
              <span style={{ fontSize: '18px' }}>{card.icon}</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 700, color: card.color, margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Top Links Perform */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Performa Link Terpopuler</h2>
        {topLinks.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: 0 }}>Belum ada data klik yang tercatat</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topLinks.map((link) => {
              const pct = totalClicks > 0 ? Math.round((link.click_count / totalClicks) * 100) : 0;
              return (
                <div key={link.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link.title || '(Tanpa Judul)'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link.url}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{link.click_count} klik</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>({pct}%)</span>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(4, pct)}%`, background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown 3 Columns (Referrer, Devices, OS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Referrers */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Sumber Trafik (Referrer)</h3>
          {referrerEntries.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>Belum ada data sumber trafik</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {referrerEntries.map(([source, count]) => {
                const pct = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0;
                return (
                  <div key={source}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{source}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(4, pct)}%`, background: '#38bdf8', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Devices */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Tipe Perangkat (Devices)</h3>
          {deviceEntries.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>Belum ada data perangkat</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deviceEntries.map(([dev, count]) => {
                const pct = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0;
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
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Sistem Operasi (OS)</h3>
          {osEntries.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>Belum ada data OS</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {osEntries.map(([os, count]) => {
                const pct = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0;
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
