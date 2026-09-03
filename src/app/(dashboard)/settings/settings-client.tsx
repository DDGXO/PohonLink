'use client';

import { useState, useTransition, useRef } from 'react';
import {
  updateProfile,
  updateUsername,
  deleteOwnAccount,
  uploadAvatar,
  removeAvatar,
  exportUserData,
  importUserData,
} from '@/app/actions';

import type { ProfileSettings } from '@/types/database';
import ImageCropperModal from '@/components/image-cropper-modal';

interface Props {
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  settings: ProfileSettings;
  host?: string;
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{desc}</p>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: checked ? 'var(--accent)' : 'var(--border)', borderRadius: '22px', transition: '.2s'
        }}>
          <span style={{
            position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px',
            backgroundColor: checked ? '#000' : 'var(--text-dim)', borderRadius: '50%', transition: '.2s',
            transform: checked ? 'translateX(18px)' : 'translateX(0)'
          }} />
        </span>
      </label>
    </div>
  );
}

function DeleteAccountSection() {
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'countdown'>('idle');
  const [countdown, setCountdown] = useState(10);
  const [isPending, startTransition] = useTransition();

  const startCountdown = () => {
    setPhase('countdown');
    setCountdown(10);
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOwnAccount();
    });
  };

  return (
    <div style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', padding: '24px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--danger)', marginBottom: '6px' }}>Hapus Akun</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Akun kamu, semua link, dan data akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
      {phase === 'idle' && <button onClick={() => setPhase('confirm')} style={{ padding: '9px 18px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer' }}>Hapus Akun Saya</button>}
      {phase === 'confirm' && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Yakin? Ini tidak bisa dibatalkan.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={startCountdown} style={{ padding: '9px 18px', background: 'var(--danger)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Ya, Lanjutkan</button>
            <button onClick={() => setPhase('idle')} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}
      {phase === 'countdown' && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>{countdown > 0 ? `Tunggu ${countdown} detik...` : 'Siap menghapus akun.'}</p>
          <button onClick={handleDelete} disabled={countdown > 0 || isPending} style={{ padding: '9px 18px', background: countdown > 0 ? 'var(--border-hover)' : 'var(--danger)', border: 'none', borderRadius: '8px', color: countdown > 0 ? 'var(--text-dim)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}>
            {isPending ? 'Menghapus...' : countdown > 0 ? `Hapus Akun (${countdown})` : 'Hapus Akun Sekarang'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsClient({ email, username, displayName, bio, avatarUrl: initialAvatar, settings, host }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preferencesMsg, setPreferencesMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarShapeMsg, setAvatarShapeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  };

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Ukuran foto maksimal 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePerformCroppedAvatar = (blob: Blob) => {
    setCropImageSrc(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('avatar', blob, 'avatar.webp');
      const res = await uploadAvatar(fd);
      if (res?.error) {
        setProfileMsg({ type: 'error', text: res.error });
      } else if (res?.avatar_url) {
        setAvatarUrl(res.avatar_url);
        setProfileMsg({ type: 'success', text: 'Foto profil berhasil dipotong & diunggah!' });
      }
    });
  };

  const handleRemoveAvatar = () => {
    if (!confirm('Hapus foto profil?')) return;
    startTransition(async () => {
      const res = await removeAvatar();
      if (!res?.error) {
        setAvatarUrl(null);
        setProfileMsg({ type: 'success', text: 'Foto profil dihapus' });
      }
    });
  };

  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      fd.append('settings', JSON.stringify(localSettings));
      const result = await updateProfile(fd);
      setProfileMsg(result?.error ? { type: 'error', text: result.error } : { type: 'success', text: 'Profil diperbarui!' });
    });
  };

  const handleUsername = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateUsername(new FormData(e.currentTarget));
      setUsernameMsg(result?.error ? { type: 'error', text: result.error } : { type: 'success', text: 'Username diperbarui!' });
    });
  };

  const handleSettingToggle = (key: string, val: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSavePreferences = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('display_name', displayName);
      fd.append('bio', bio);
      fd.append('settings', JSON.stringify(localSettings));
      const res = await updateProfile(fd);
      if (res?.error) setPreferencesMsg({ type: 'error', text: res.error });
      else {
        setPreferencesMsg({ type: 'success', text: 'Preferensi halaman berhasil disimpan!' });
        setTimeout(() => setPreferencesMsg(null), 3000);
      }
    });
  };

  const handleSaveAvatarShape = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('display_name', displayName);
      fd.append('bio', bio);
      fd.append('settings', JSON.stringify(localSettings));
      const res = await updateProfile(fd);
      if (res?.error) setAvatarShapeMsg({ type: 'error', text: res.error });
      else {
        setAvatarShapeMsg({ type: 'success', text: 'Bentuk foto/logo berhasil disimpan!' });
        setTimeout(() => setAvatarShapeMsg(null), 3000);
      }
    });
  };

  const handleSocialChange = (key: string, val: string) => {
    setLocalSettings(prev => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        [key]: val,
      },
    }));
  };

  const handleSaveSocials = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('display_name', displayName);
      fd.append('bio', bio);
      fd.append('settings', JSON.stringify(localSettings));
      const res = await updateProfile(fd);
      if (res?.error) setProfileMsg({ type: 'error', text: res.error });
      else setProfileMsg({ type: 'success', text: 'Tautan media sosial berhasil disimpan!' });
    });
  };

  const handleExport = async () => {
    startTransition(async () => {
      const res = await exportUserData();
      if (res?.success && res.data) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `pohonlink-backup-${username}-${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setBackupMsg({ type: 'success', text: 'Backup berhasil diunduh!' });
      } else {
        setBackupMsg({ type: 'error', text: 'Gagal mengunduh backup' });
      }
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!confirm('Import data backup? Link yang ada saat ini akan digantikan oleh backup ini.')) return;

        startTransition(async () => {
          const res = await importUserData(parsed);
          if (res?.success) {
            setBackupMsg({ type: 'success', text: 'Data berhasil diimport!' });
            setTimeout(() => window.location.reload(), 1000);
          } else {
            setBackupMsg({ type: 'error', text: 'Gagal import data' });
          }
        });
      } catch {
        setBackupMsg({ type: 'error', text: 'File backup tidak valid (harus file JSON)' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '540px' }}>
      {/* Avatar Section */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Foto Profil (Avatar)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '18px' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: localSettings?.avatar_shape === 'circle' || !localSettings?.avatar_shape ? '50%' : localSettings.avatar_shape === 'rounded' ? '14px' : '4px',
                objectFit: localSettings?.avatar_shape === 'square' ? 'contain' : 'cover',
                border: localSettings?.avatar_shape === 'square' ? '1px dashed var(--border-hover)' : '2px solid var(--border-hover)',
                background: localSettings?.avatar_shape === 'square' ? 'transparent' : 'var(--bg)',
              }}
            />
          ) : (
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: localSettings?.avatar_shape === 'circle' || !localSettings?.avatar_shape ? '50%' : localSettings.avatar_shape === 'rounded' ? '14px' : '4px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              🌿
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="file" ref={fileInputRef} onChange={handleAvatarFileSelect} accept="image/*" style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                style={{ padding: '8px 16px', background: 'var(--accent)', color: '#000', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {isPending ? 'Mengunggah...' : 'Ganti & Crop Foto'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isPending}
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hapus
                </button>
              )}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Format: JPG, PNG, WEBP. Maksimal 5MB.</p>
          </div>
        </div>

        {/* Shape selector */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Bentuk Tampilan Foto / Logo:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'circle' as const, label: '⚪ Bulat' },
              { id: 'rounded' as const, label: '🔲 Melengkung' },
              { id: 'square' as const, label: '⏹️ Kotak Transparan' },
            ].map((shape) => {
              const active = (localSettings?.avatar_shape || 'circle') === shape.id;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => {
                    setLocalSettings(prev => ({ ...prev, avatar_shape: shape.id }));
                  }}
                  style={{
                    padding: '8px 10px',
                    background: active ? 'var(--accent-dim)' : 'var(--bg)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '6px',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {shape.label}
                </button>
              );
            })}
          </div>

          {avatarShapeMsg && (
            <div style={{
              padding: '8px 12px', borderRadius: '6px', marginTop: '12px', fontSize: '12px',
              background: avatarShapeMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
              border: `1px solid ${avatarShapeMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
              color: avatarShapeMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            }}>{avatarShapeMsg.text}</div>
          )}

          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              onClick={handleSaveAvatarShape}
              disabled={isPending}
              style={{
                padding: '8px 16px', background: 'var(--surface)',
                border: '1px solid var(--border-hover)', borderRadius: '6px',
                color: 'var(--text)', fontSize: '12px', fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Bentuk Foto'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Info Profil</h2>
        {profileMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px',
            background: profileMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
            border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
            color: profileMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          }}>{profileMsg.text}</div>
        )}
        <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>EMAIL</label>
            <input value={email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>NAMA TAMPILAN</label>
            <input name="display_name" type="text" defaultValue={displayName} placeholder="Nama kamu" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>BIO</label>
            <textarea name="bio" defaultValue={bio} placeholder="Ceritakan tentang dirimu..."
              rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={isPending} style={{
            padding: '10px 20px', background: 'var(--accent)', color: '#000',
            borderRadius: '8px', border: 'none', fontSize: '13px',
            fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', alignSelf: 'flex-start',
          }}>Simpan</button>
        </form>
      </div>

      {/* Username */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Username</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>URL profil kamu: {host ? `${host}/@${username}` : `@${username}`}</p>
        {usernameMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px',
            background: usernameMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
            border: `1px solid ${usernameMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
            color: usernameMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          }}>{usernameMsg.text}</div>
        )}
        <form onSubmit={handleUsername} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '14px', color: 'var(--text-dim)',
            }}>@</span>
            <input name="username" type="text" defaultValue={username}
              style={{ ...inputStyle, paddingLeft: '28px' }} />
          </div>
          <button type="submit" disabled={isPending} style={{
            padding: '10px 16px', background: 'var(--accent)', color: '#000',
            borderRadius: '8px', border: 'none', fontSize: '13px',
            fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
          }}>Ubah</button>
        </form>
      </div>

      {/* Preferences */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Preferensi Halaman</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ToggleRow
            label="Buka link di tab baru"
            desc="Semua link eksternal dibuka di tab baru (_blank)"
            checked={localSettings?.open_links_new_tab || false}
            onChange={val => handleSettingToggle('open_links_new_tab', val)}
          />
          <ToggleRow
            label="Tampilkan tombol share"
            desc="Tampilkan tombol share melayang di halaman profil"
            checked={localSettings?.show_share_button ?? true}
            onChange={val => handleSettingToggle('show_share_button', val)}
          />
          <ToggleRow
            label="Sembunyikan handle @username"
            desc="Hanya tampilkan Nama dan Bio di halaman profil"
            checked={localSettings?.hide_username || false}
            onChange={val => handleSettingToggle('hide_username', val)}
          />
          <ToggleRow
            label="Tampilkan Footer"
            desc="Tampilkan atribusi 'Dibuat dengan Pohonlink' atau teks kustom di bagian bawah profil"
            checked={localSettings?.show_footer ?? true}
            onChange={val => handleSettingToggle('show_footer', val)}
          />
          {(localSettings?.show_footer ?? true) && (
            <div style={{ paddingLeft: '12px', borderLeft: '2px solid var(--accent)', marginTop: '2px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Kustom Teks Footer (Opsional)
              </label>
              <input
                type="text"
                placeholder="Kosongkan untuk default (🌿 Dibuat dengan Pohonlink)"
                value={localSettings?.custom_footer_text || ''}
                onChange={e => {
                  const val = e.target.value;
                  setLocalSettings(prev => ({ ...prev, custom_footer_text: val }));
                }}
                maxLength={100}
                style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Maksimal 100 karakter. Kosongkan jika ingin menampilkan branding default.
              </p>
            </div>
          )}

          {preferencesMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              background: preferencesMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
              border: `1px solid ${preferencesMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
              color: preferencesMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            }}>{preferencesMsg.text}</div>
          )}

          <div>
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isPending}
              style={{
                padding: '10px 20px', background: 'var(--accent)', color: '#000',
                borderRadius: '8px', border: 'none', fontSize: '13px',
                fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Preferensi'}
            </button>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Ikon Media Sosial</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Tampilkan ikon media sosial transparan di profil kamu.</p>

        {/* Social Position Switcher */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Posisi Deretan Ikon Media Sosial:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { id: 'top' as const, label: '⬆️ Bagian Atas', desc: 'Di bawah bio & foto profil' },
              { id: 'bottom' as const, label: '⬇️ Bagian Bawah', desc: 'Di atas footer halaman' },
            ].map(pos => {
              const active = (localSettings.social_position || 'top') === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, social_position: pos.id }))}
                  style={{
                    padding: '10px 12px',
                    background: active ? 'var(--accent-dim)' : 'var(--bg)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', margin: '0 0 2px' }}>{pos.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>{pos.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="responsive-grid-2col">
          {[
            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
            { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
            { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
            { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/...' },
            { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
            { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
            { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/62...' },
            { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/...' },
          ].map(item => (
            <div key={item.key}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {item.label}
              </label>
              <input
                type="url"
                value={localSettings.social_links?.[item.key] || ''}
                onChange={e => handleSocialChange(item.key, e.target.value)}
                placeholder={item.placeholder}
                style={{ ...inputStyle, padding: '7px 10px', fontSize: '12px' }}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSaveSocials}
          disabled={isPending}
          style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan Media Sosial'}
        </button>
      </div>

      {/* Backup & Restore */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Backup & Restore Data</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Ekspor seluruh profil dan tautan ke file JSON, atau pulihkan dari file cadangan.</p>
        {backupMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px',
            background: backupMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
            border: `1px solid ${backupMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
            color: backupMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          }}>{backupMsg.text}</div>
        )}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExport}
            disabled={isPending}
            style={{ padding: '9px 18px', background: 'var(--surface)', border: '1px solid var(--border-hover)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
          >
            📥 Ekspor Data (JSON)
          </button>
          <input type="file" ref={importInputRef} onChange={handleImport} accept=".json,application/json" style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            disabled={isPending}
            style={{ padding: '9px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
          >
            📤 Impor Data
          </button>
        </div>
      </div>

      <DeleteAccountSection />

      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspectRatio={1}
          circularCrop={true}
          title="Crop Foto Profil"
          onCrop={handlePerformCroppedAvatar}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
}
