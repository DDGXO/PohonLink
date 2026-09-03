export default function DashboardLoading() {
  return (
    <div style={{ width: '100%', animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ width: '180px', height: '26px', background: 'var(--surface)', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ width: '260px', height: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
      </div>

      {/* Grid Content Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ height: '110px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }} />
        <div style={{ height: '110px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }} />
        <div style={{ height: '110px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }} />
      </div>

      {/* Main Section Skeleton */}
      <div style={{ height: '240px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }} />
    </div>
  );
}
