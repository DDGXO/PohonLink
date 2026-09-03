'use client';

import { useState, useTransition } from 'react';
import { adminBlockUser, adminDeleteUser, adminToggleVip, adminCreateUser } from '@/app/actions';
import type { Profile } from '@/types/database';

export default function AdminUsersClient({ users: initial }: { users: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initial);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleBlock = (userId: string, currentBlock: boolean) => {
    startTransition(async () => {
      await adminBlockUser(userId, !currentBlock);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !currentBlock } : u));
    });
  };

  const handleToggleVip = (userId: string, currentRole: string) => {
    const isVip = currentRole === 'vip';
    startTransition(async () => {
      await adminToggleVip(userId, !isVip);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: isVip ? 'user' : 'vip' } : u));
    });
  };

  const handleDelete = (userId: string) => {
    if (!confirm('Hapus user ini permanen?')) return;
    startTransition(async () => {
      await adminDeleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    });
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await adminCreateUser(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setShowAddModal(false);
        setError(null);
        window.location.reload();
      }
    });
  };

  const inputStyle = {
    width: '100%', padding: '9px 13px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: '7px',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '9px 18px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Tambah Pengguna
        </button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Tambah Pengguna Baru</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: 'var(--danger)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>NAMA</label>
                <input name="display_name" type="text" placeholder="Nama lengkap" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>USERNAME</label>
                <input name="username" type="text" placeholder="username" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>EMAIL</label>
                <input name="email" type="email" placeholder="email@contoh.com" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>PASSWORD</label>
                <input name="password" type="password" placeholder="Min 6 karakter" required minLength={6} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={isPending} style={{ padding: '9px 18px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}>
                  {isPending ? 'Menyimpan...' : 'Buat Akun'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '9px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {users.map(u => (
          <div key={u.id} className="user-card-item" style={{ opacity: u.is_blocked ? 0.6 : 1 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                <a href={`/@${u.username}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                  @{u.username} ↗
                </a>
                {u.role === 'admin' && <span style={{ fontSize: '10px', background: 'rgba(255,77,77,0.15)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ADMIN</span>}
                {u.role === 'vip' && <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>VIP / VERIFIED</span>}
                {u.is_blocked && <span style={{ fontSize: '10px', background: 'rgba(255,77,77,0.15)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>BLOCKED</span>}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{u.display_name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Bergabung: {new Date(u.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {u.role === 'admin' ? (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--bg)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  🛡️ Akun Terlindungi
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleVip(u.id, u.role)}
                    disabled={isPending}
                    style={{
                      padding: '6px 10px',
                      background: u.role === 'vip' ? 'rgba(59,130,246,0.15)' : 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: u.role === 'vip' ? '#3b82f6' : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: 500, cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                    title="Toggle VIP & Centang Biru"
                  >
                    {u.role === 'vip' ? '✓ VIP' : '+ Set VIP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBlock(u.id, u.is_blocked)}
                    disabled={isPending}
                    style={{
                      padding: '6px 12px',
                      background: u.is_blocked ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
                      border: `1px solid ${u.is_blocked ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
                      borderRadius: '6px',
                      color: u.is_blocked ? 'var(--success)' : 'var(--danger)',
                      fontSize: '12px', cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {u.is_blocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
                    disabled={isPending}
                    style={{
                      padding: '6px 12px', background: 'rgba(255,77,77,0.1)',
                      border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px',
                      color: 'var(--danger)', fontSize: '12px', cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
