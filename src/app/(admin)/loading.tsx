export default function AdminLoading() {
  return (
    <div style={{ maxWidth: '900px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ width: '180px', height: '24px', background: 'var(--surface)', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ width: '260px', height: '14px', background: 'var(--surface)', borderRadius: '4px', opacity: 0.6 }} />
      </div>

      {/* Grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
              height: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ width: '32px', height: '20px', background: 'var(--bg)', borderRadius: '4px' }} />
            <div style={{ width: '80px', height: '28px', background: 'var(--bg)', borderRadius: '6px' }} />
            <div style={{ width: '100px', height: '12px', background: 'var(--bg)', borderRadius: '4px', opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', height: '200px' }}>
        <div style={{ width: '120px', height: '16px', background: 'var(--bg)', borderRadius: '4px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: '100%', height: '36px', background: 'var(--bg)', borderRadius: '6px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
