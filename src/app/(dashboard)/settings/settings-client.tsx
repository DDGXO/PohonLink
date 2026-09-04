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
  updateCustomSEO,
  updateAutoRedirect,
  updateVCardConfig,
  updateMarketingPixels,
  updateAutoDmConfig,
} from '@/app/actions';

import type { ProfileSettings } from '@/types/database';
import ImageCropperModal from '@/components/image-cropper-modal';
import QRCodeCard from '@/components/qr-code-card';
import ConfirmDialog from '@/components/confirm-dialog';
import Toast from '@/components/toast';
import SocialIcon from '@/components/social-icons';

interface Props {
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  settings: ProfileSettings;
  host?: string;
}

type SettingsTab = 'profile' | 'seo' | 'pixels' | 'vcard' | 'automation' | 'socials' | 'preferences';

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{desc}</p>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', flexShrink: 0 }}>
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
      {phase === 'idle' && <button type="button" onClick={() => setPhase('confirm')} style={{ padding: '9px 18px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer' }}>Hapus Akun Saya</button>}
      {phase === 'confirm' && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Yakin? Ini tidak bisa dibatalkan.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={startCountdown} style={{ padding: '9px 18px', background: 'var(--danger)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Ya, Lanjutkan</button>
            <button type="button" onClick={() => setPhase('idle')} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}
      {phase === 'countdown' && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>{countdown > 0 ? `Tunggu ${countdown} detik...` : 'Siap menghapus akun.'}</p>
          <button type="button" onClick={handleDelete} disabled={countdown > 0 || isPending} style={{ padding: '9px 18px', background: countdown > 0 ? 'var(--border-hover)' : 'var(--danger)', border: 'none', borderRadius: '8px', color: countdown > 0 ? 'var(--text-dim)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}>
            {isPending ? 'Menghapus...' : countdown > 0 ? `Hapus Akun (${countdown})` : 'Hapus Akun Sekarang'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsClient({ email, username, displayName, bio, avatarUrl: initialAvatar, settings, host }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preferencesMsg, setPreferencesMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarShapeMsg, setAvatarShapeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' | 'danger' } | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);
  const [avatarShape, setAvatarShape] = useState<'circle' | 'rounded' | 'square' | 'wide' | 'original' | 'custom'>(settings?.avatar_shape || 'circle');
  const [avatarMasking, setAvatarMasking] = useState<'crop' | 'full'>(settings?.avatar_masking || (settings?.avatar_shape === 'original' ? 'full' : 'crop'));
  const [avatarFit, setAvatarFit] = useState<'cover' | 'contain' | 'fill'>(settings?.avatar_fit || 'cover');
  const [avatarZoom, setAvatarZoom] = useState<number>(settings?.avatar_zoom ?? 100);
  const [avatarSize, setAvatarSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>(settings?.avatar_size || 'medium');
  const [avatarBorderStyle, setAvatarBorderStyle] = useState<'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'glow'>(settings?.avatar_border_style || 'solid');
  const [avatarBorderWidth, setAvatarBorderWidth] = useState<number>(settings?.avatar_border_width ?? 2);
  const [avatarBorderColor, setAvatarBorderColor] = useState<string>(settings?.avatar_border_color || '#4ade80');
  const [avatarShadow, setAvatarShadow] = useState<'none' | 'soft' | 'hard' | 'glow'>(settings?.avatar_shadow || 'soft');
  const [avatarRadiusCustom, setAvatarRadiusCustom] = useState<number>(settings?.avatar_radius_custom ?? (settings?.avatar_shape === 'circle' ? 50 : 16));
  const [avatarOffsetX, setAvatarOffsetX] = useState<number>(settings?.avatar_offset_x ?? 0);
  const [avatarOffsetY, setAvatarOffsetY] = useState<number>(settings?.avatar_offset_y ?? 0);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(settings?.avatar_video_url || '');
  const [isPending, startTransition] = useTransition();
  const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<unknown | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Direct Drag-to-Pan state for Interactive Mini Preview
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number }>({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startOffsetX: avatarOffsetX,
      startOffsetY: avatarOffsetY,
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    // Scale sensitivity
    const scaleFactor = 0.6;
    const nextX = Math.min(100, Math.max(-100, Math.round(dragStartRef.current.startOffsetX + deltaX * scaleFactor)));
    const nextY = Math.min(100, Math.max(-100, Math.round(dragStartRef.current.startOffsetY + deltaY * scaleFactor)));
    setAvatarOffsetX(nextX);
    setAvatarOffsetY(nextY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

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
      setToast({ message: 'Ukuran foto maksimal 5MB', type: 'error' });
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
        setToast({ message: res.error, type: 'error' });
      } else if (res?.avatar_url) {
        setAvatarUrl(res.avatar_url);
        setProfileMsg({ type: 'success', text: 'Foto profil berhasil dipotong & diunggah!' });
        setToast({ message: 'Foto profil berhasil diperbarui!', type: 'success' });
      }
    });
  };

  const handleRemoveAvatar = () => {
    setShowRemoveAvatarConfirm(true);
  };

  const handleConfirmRemoveAvatar = () => {
    setShowRemoveAvatarConfirm(false);
    startTransition(async () => {
      const res = await removeAvatar();
      if (res?.error) {
        setToast({ message: res.error, type: 'error' });
      } else {
        setAvatarUrl(null);
        setProfileMsg({ type: 'success', text: 'Foto profil dihapus' });
        setToast({ message: 'Foto profil berhasil dihapus!', type: 'success' });
      }
    });
  };

  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      fd.append('settings', JSON.stringify(localSettings));
      const result = await updateProfile(fd);
      if (result?.error) {
        setProfileMsg({ type: 'error', text: result.error });
        setToast({ message: result.error, type: 'error' });
      } else {
        setProfileMsg({ type: 'success', text: 'Profil diperbarui!' });
        setToast({ message: 'Informasi profil berhasil disimpan!', type: 'success' });
      }
    });
  };

  const handleUsername = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateUsername(new FormData(e.currentTarget));
      if (result?.error) {
        setUsernameMsg({ type: 'error', text: result.error });
        setToast({ message: result.error, type: 'error' });
      } else {
        setUsernameMsg({ type: 'success', text: 'Username diperbarui!' });
        setToast({ message: 'Username berhasil diperbarui!', type: 'success' });
      }
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
      if (res?.error) {
        setPreferencesMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setPreferencesMsg({ type: 'success', text: 'Preferensi halaman berhasil disimpan!' });
        setToast({ message: 'Preferensi halaman berhasil disimpan!', type: 'success' });
        setTimeout(() => setPreferencesMsg(null), 3000);
      }
    });
  };

  const handleSaveAvatarSettings = () => {
    startTransition(async () => {
      const updatedSettings = {
        ...localSettings,
        avatar_shape: avatarShape,
        avatar_masking: avatarMasking,
        avatar_fit: avatarFit,
        avatar_zoom: avatarZoom,
        avatar_size: avatarSize,
        avatar_border_style: avatarBorderStyle,
        avatar_border_width: avatarBorderWidth,
        avatar_border_color: avatarBorderColor,
        avatar_shadow: avatarShadow,
        avatar_radius_custom: avatarRadiusCustom,
        avatar_offset_x: avatarOffsetX,
        avatar_offset_y: avatarOffsetY,
        avatar_video_url: avatarVideoUrl.trim(),
      };
      setLocalSettings(updatedSettings);
      const fd = new FormData();
      fd.append('display_name', displayName);
      fd.append('bio', bio);
      fd.append('settings', JSON.stringify(updatedSettings));
      const res = await updateProfile(fd);
      if (res?.error) {
        setAvatarShapeMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setAvatarShapeMsg({ type: 'success', text: 'Pengaturan avatar berhasil disimpan!' });
        setToast({ message: 'Pengaturan avatar berhasil disimpan!', type: 'success' });
        setTimeout(() => setAvatarShapeMsg(null), 3000);
      }
    });
  };

  const handleRemoveMovingAvatar = () => {
    setAvatarVideoUrl('');
    startTransition(async () => {
      const updatedSettings = {
        ...localSettings,
        avatar_shape: avatarShape,
        avatar_masking: avatarMasking,
        avatar_fit: avatarFit,
        avatar_zoom: avatarZoom,
        avatar_size: avatarSize,
        avatar_border_style: avatarBorderStyle,
        avatar_border_width: avatarBorderWidth,
        avatar_border_color: avatarBorderColor,
        avatar_shadow: avatarShadow,
        avatar_radius_custom: avatarRadiusCustom,
        avatar_offset_x: avatarOffsetX,
        avatar_offset_y: avatarOffsetY,
        avatar_video_url: '',
      };
      setLocalSettings(updatedSettings);
      const fd = new FormData();
      fd.append('display_name', displayName);
      fd.append('bio', bio);
      fd.append('settings', JSON.stringify(updatedSettings));
      const res = await updateProfile(fd);
      if (res?.error) {
        setToast({ message: res.error, type: 'error' });
      } else {
        setToast({ message: 'Avatar bergerak berhasil dihapus!', type: 'success' });
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
      if (res?.error) {
        setProfileMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setProfileMsg({ type: 'success', text: 'Tautan media sosial berhasil disimpan!' });
        setToast({ message: 'Tautan media sosial berhasil disimpan!', type: 'success' });
      }
    });
  };

  const [seoMsg, setSeoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redirectMsg, setRedirectMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [vcardMsg, setVcardMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pixelsMsg, setPixelsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [autoDmMsg, setAutoDmMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Bio State
  const [showAiBioModal, setShowAiBioModal] = useState(false);
  const [aiBioPrompt, setAiBioPrompt] = useState('');
  const [aiBioTone, setAiBioTone] = useState('modern & engaging');
  const [generatedBios, setGeneratedBios] = useState<string[]>([]);
  const [isAiBioLoading, setIsAiBioLoading] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio);

  // Auto-DM AI State
  const [isAutoDmAiLoading, setIsAutoDmAiLoading] = useState(false);

  const handleGenerateAiBio = async () => {
    if (!aiBioPrompt.trim()) return;
    setIsAiBioLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bio', prompt: aiBioPrompt, tone: aiBioTone }),
      });
      const data = await res.json();
      if (data?.bios && Array.isArray(data.bios)) {
        setGeneratedBios(data.bios);
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Gagal membuat Bio dengan AI' });
    } finally {
      setIsAiBioLoading(false);
    }
  };

  const handleSelectBioOption = (selected: string) => {
    setCurrentBio(selected);
    setShowAiBioModal(false);
  };

  const handleGenerateAutoDmAI = async () => {
    const keyword = localSettings.auto_dm?.keyword || 'LINK';
    const linkUrl = host ? `${host}/@${username}` : `https://pohonlink.id/@${username}`;
    setIsAutoDmAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto-dm', keyword, linkUrl }),
      });
      const data = await res.json();
      if (data?.templates) {
        setLocalSettings(prev => ({
          ...prev,
          auto_dm: {
            enabled: true,
            keyword,
            message: data.templates.directReply || '',
          },
        }));
      }
    } catch {
      setAutoDmMsg({ type: 'error', text: 'Gagal generate template Auto-DM AI' });
    } finally {
      setIsAutoDmAiLoading(false);
    }
  };

  const handleSavePixels = () => {
    startTransition(async () => {
      const res = await updateMarketingPixels(localSettings.marketing_pixels || {});
      if (res?.error) {
        setPixelsMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setPixelsMsg({ type: 'success', text: 'Tracking Pixel berhasil disimpan!' });
        setToast({ message: 'Tracking Pixels berhasil disimpan!', type: 'success' });
        setTimeout(() => setPixelsMsg(null), 3000);
      }
    });
  };

  const handleSaveAutoDm = () => {
    startTransition(async () => {
      const res = await updateAutoDmConfig(localSettings.auto_dm || { enabled: false, keyword: '', message: '' });
      if (res?.error) {
        setAutoDmMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setAutoDmMsg({ type: 'success', text: 'Pengaturan Auto-DM berhasil disimpan!' });
        setToast({ message: 'Pengaturan Auto-DM Instagram disimpan!', type: 'success' });
        setTimeout(() => setAutoDmMsg(null), 3000);
      }
    });
  };

  const handleSaveSeo = () => {
    startTransition(async () => {
      const res = await updateCustomSEO(localSettings.seo_meta || {});
      if (res?.error) {
        setSeoMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setSeoMsg({ type: 'success', text: 'Pengaturan SEO berhasil disimpan!' });
        setToast({ message: 'Pengaturan SEO & OpenGraph berhasil disimpan!', type: 'success' });
        setTimeout(() => setSeoMsg(null), 3000);
      }
    });
  };

  const handleSaveAutoRedirect = () => {
    startTransition(async () => {
      const res = await updateAutoRedirect(localSettings.auto_redirect || { enabled: false, url: '' });
      if (res?.error) {
        setRedirectMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setRedirectMsg({ type: 'success', text: 'Pengaturan pengalihan otomatis berhasil disimpan!' });
        setToast({ message: 'Pengaturan Auto-Redirect disimpan!', type: 'success' });
        setTimeout(() => setRedirectMsg(null), 3000);
      }
    });
  };

  const handleSaveVCard = () => {
    startTransition(async () => {
      const res = await updateVCardConfig(localSettings.vcard || { enabled: false });
      if (res?.error) {
        setVcardMsg({ type: 'error', text: res.error });
        setToast({ message: res.error, type: 'error' });
      } else {
        setVcardMsg({ type: 'success', text: 'Kontak digital vCard berhasil disimpan!' });
        setToast({ message: 'Kontak digital vCard berhasil disimpan!', type: 'success' });
        setTimeout(() => setVcardMsg(null), 3000);
      }
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
        setToast({ message: 'File backup cadangan berhasil diunduh!', type: 'success' });
      } else {
        setBackupMsg({ type: 'error', text: 'Gagal mengunduh backup' });
        setToast({ message: 'Gagal mengunduh file backup', type: 'error' });
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
        setPendingImportData(parsed);
      } catch {
        setBackupMsg({ type: 'error', text: 'File backup tidak valid (harus file JSON)' });
        setToast({ message: 'File backup tidak valid (harus file JSON)', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!pendingImportData) return;
    const data = pendingImportData;
    setPendingImportData(null);
    startTransition(async () => {
      const res = await importUserData(data as any);
      if (res?.success) {
        setBackupMsg({ type: 'success', text: 'Data berhasil diimport!' });
        setToast({ message: 'Data cadangan berhasil diimpor!', type: 'success' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setBackupMsg({ type: 'error', text: 'Gagal import data' });
        setToast({ message: 'Gagal import data cadangan', type: 'error' });
      }
    });
  };

  const copyProfileLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/@${username}` : `https://${host || 'pohonlink.id'}/@${username}`;
    navigator.clipboard.writeText(url);
    setToast({ message: 'Tautan profil disalin ke clipboard!', type: 'success' });
  };

  // Shared Avatar Renderer Function (Supports Full Canvas / Masking Mode)
  const renderAvatarPreview = (isMini = false) => {
    const isFullCanvas = avatarMasking === 'full';

    const sizeMap = {
      small: { base: isMini ? 52 : 72, wideW: isMini ? 90 : 130, wideH: isMini ? 52 : 72, maxW: 130, maxH: 80 },
      medium: { base: isMini ? 68 : 92, wideW: isMini ? 120 : 170, wideH: isMini ? 68 : 92, maxW: 170, maxH: 110 },
      large: { base: isMini ? 84 : 116, wideW: isMini ? 150 : 220, wideH: isMini ? 84 : 116, maxW: 220, maxH: 140 },
      xlarge: { base: isMini ? 104 : 148, wideW: isMini ? 190 : 280, wideH: isMini ? 104 : 148, maxW: 280, maxH: 180 },
    }[avatarSize] || { base: 92, wideW: 170, wideH: 92, maxW: 170, maxH: 110 };

    let w: string | number = sizeMap.base;
    let h: string | number = sizeMap.base;
    let r = '50%';
    let maxW: string | undefined = undefined;
    let maxH: string | undefined = undefined;

    if (avatarShape === 'circle') {
      r = '50%';
    } else if (avatarShape === 'custom') {
      r = `${avatarRadiusCustom}%`;
    } else if (avatarShape === 'rounded') {
      r = avatarSize === 'small' ? '12px' : avatarSize === 'xlarge' ? '24px' : '18px';
    } else if (avatarShape === 'square') {
      r = '4px';
    } else if (avatarShape === 'wide') {
      r = '14px';
      w = sizeMap.wideW;
      h = sizeMap.wideH;
    } else if (avatarShape === 'original') {
      r = '12px';
      w = 'auto';
      h = 'auto';
      maxW = `${sizeMap.maxW}px`;
      maxH = `${sizeMap.maxH}px`;
    }

    const effBorderWidth = avatarBorderStyle === 'none' ? 0 : (avatarBorderWidth ?? 2);
    const effBorderColor = avatarBorderColor || '#4ade80';

    let border = 'none';
    if (avatarBorderStyle !== 'none' && effBorderWidth > 0) {
      if (avatarBorderStyle === 'glow') {
        border = `${effBorderWidth}px solid ${effBorderColor}`;
      } else {
        border = `${effBorderWidth}px ${avatarBorderStyle} ${effBorderColor}`;
      }
    }

    let boxShadow = 'none';
    if (avatarBorderStyle === 'glow' || avatarShadow === 'glow') {
      boxShadow = `0 0 ${12 + effBorderWidth * 3}px ${effBorderColor}, 0 4px 16px rgba(0,0,0,0.35)`;
    } else if (avatarShadow === 'hard') {
      boxShadow = `4px 4px 0px ${effBorderColor || '#000000'}`;
    } else if (avatarShadow === 'soft') {
      boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    }

    const currentMoving = avatarVideoUrl.trim();
    const isVideoFile = currentMoving.endsWith('.mp4') || currentMoving.endsWith('.webm') || currentMoving.includes('format=mp4') || currentMoving.includes('.mp4?') || currentMoving.includes('.webm?');

    const containerStyle: React.CSSProperties = {
      width: isFullCanvas ? 'auto' : w,
      height: isFullCanvas ? 'auto' : h,
      maxWidth: maxW,
      maxHeight: maxH,
      borderRadius: r,
      overflow: isFullCanvas ? 'visible' : 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: shapeIsTransparent(avatarShape) || isFullCanvas ? 'transparent' : 'rgba(255,255,255,0.06)',
      border: isFullCanvas && !currentMoving && !avatarUrl ? border : (isFullCanvas ? 'none' : border),
      boxShadow: isFullCanvas ? 'none' : boxShadow,
      transition: 'all 0.15s ease',
      flexShrink: 0,
      userSelect: 'none',
    };

    const mediaStyle: React.CSSProperties = {
      width: isFullCanvas ? 'auto' : (avatarShape === 'original' ? 'auto' : '100%'),
      height: isFullCanvas ? 'auto' : (avatarShape === 'original' ? 'auto' : '100%'),
      maxWidth: isFullCanvas ? (isMini ? '120px' : '280px') : '100%',
      maxHeight: isFullCanvas ? (isMini ? '90px' : '200px') : '100%',
      objectFit: isFullCanvas ? 'contain' : avatarFit,
      borderRadius: isFullCanvas ? r : undefined,
      border: isFullCanvas ? border : undefined,
      boxShadow: isFullCanvas ? boxShadow : undefined,
      objectPosition: !isFullCanvas ? `${50 + avatarOffsetX}% ${50 + avatarOffsetY}%` : undefined,
      transform: isFullCanvas
        ? `translate(${avatarOffsetX}%, ${avatarOffsetY}%) scale(${avatarZoom / 100})`
        : `scale(${avatarZoom / 100})`,
      transformOrigin: 'center center',
      display: 'block',
      transition: isDragging ? 'none' : 'transform 0.05s ease',
      pointerEvents: 'none',
    };

    if (currentMoving) {
      return (
        <div style={containerStyle}>
          {isVideoFile ? (
            <video
              src={currentMoving}
              autoPlay
              loop
              muted
              playsInline
              style={mediaStyle}
            />
          ) : (
            <img
              src={currentMoving}
              alt="Preview Avatar Bergerak"
              style={mediaStyle}
            />
          )}
        </div>
      );
    }

    if (avatarUrl) {
      return (
        <div style={containerStyle}>
          <img
            src={avatarUrl}
            alt="Preview Avatar"
            style={mediaStyle}
          />
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        <span style={{ fontSize: avatarSize === 'small' ? '28px' : avatarSize === 'xlarge' ? '50px' : '36px' }}>🌿</span>
      </div>
    );
  };

  function shapeIsTransparent(shape: string) {
    return shape === 'square' || shape === 'original';
  }

  const subSettingsTabs: { id: SettingsTab; label: string; icon: string; desc: string }[] = [
    { id: 'profile', label: 'Profil & Akun', icon: '👤', desc: 'Avatar, Nama, Bio, Username' },
    { id: 'seo', label: 'SEO & Metadata', icon: '🔍', desc: 'Title, Deskripsi, Banner OG Google' },
    { id: 'pixels', label: 'Pelacakan & Pixel', icon: '📊', desc: 'Meta Pixel, GA4, GTM, TikTok' },
    { id: 'vcard', label: 'Kontak & vCard', icon: '📇', desc: 'Kartu Kontak Digital, QR Code' },
    { id: 'automation', label: 'Otomasi & AI', icon: '🤖', desc: 'Auto-DM Medsos, Auto-Redirect' },
    { id: 'socials', label: 'Media Sosial', icon: '🌐', desc: 'Tautan & Ikon Profil Medsos' },
    { id: 'preferences', label: 'Preferensi & Data', icon: '⚙️', desc: 'Pengaturan Halaman, Backup, Hapus' },
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Sub Settings Tabs Header */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)',
      }}>
        {subSettingsTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '15px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SETTING 1: PROFIL & AKUN (Responsive 2-Column Desktop Grid) */}
      {activeTab === 'profile' && (
        <div className="settings-desktop-grid">
          {/* Left Column: Username (Top Priority), Profile Info & Avatar Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Username Card (Top Priority) */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Username Akun</h2>
                <button
                  type="button"
                  onClick={copyProfileLink}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📋 Salin Link Profil
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                URL profil kamu:{' '}
                <a
                  href={host ? `${host}/@${username}` : `/@${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', fontWeight: 500 }}
                >
                  {host ? `${host}/@${username}` : `@${username}`} ↗
                </a>
              </p>
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
                }}>Ubah Username</button>
              </form>
            </div>

            {/* 2. Profile Info Card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Info Profil</h2>
                <button
                  type="button"
                  onClick={() => setShowAiBioModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  ✨ Buat Bio AI
                </button>
              </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)' }}>BIO</label>
                  </div>
                  <textarea
                    name="bio"
                    value={currentBio}
                    onChange={e => setCurrentBio(e.target.value)}
                    placeholder="Ceritakan tentang dirimu..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <button type="submit" disabled={isPending} style={{
                  padding: '10px 20px', background: 'var(--accent)', color: '#000',
                  borderRadius: '8px', border: 'none', fontSize: '13px',
                  fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', alignSelf: 'flex-start',
                }}>Simpan Info Profil</button>
              </form>
            </div>

            {/* 3. Foto Profil & Avatar Section */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Foto Profil & Avatar</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Kustomisasi lengkap</span>
              </div>

              {/* Media Upload & URL Section */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarFileSelect} accept="image/*" style={{ display: 'none' }} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    style={{
                      padding: '8px 16px', background: 'var(--accent)', color: '#000',
                      borderRadius: '6px', border: 'none', fontSize: '13px',
                      fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isPending ? 'Mengunggah...' : 'Upload & Crop Foto'}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isPending}
                      style={{
                        padding: '8px 14px', background: 'transparent',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--danger)', fontSize: '13px',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Hapus Foto Profil
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '0 0 16px' }}>
                  Format foto statis: JPG, PNG, WEBP. Maksimal 5MB.
                </p>

                {/* Video / GIF Moving Avatar URL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Atau URL Avatar Bergerak / Animasi (GIF / MP4 / WebM):
                  </label>
                  <input
                    type="url"
                    placeholder="https://c.tenor.com/.../tenor.gif atau https://.../avatar.mp4"
                    value={avatarVideoUrl}
                    onChange={e => setAvatarVideoUrl(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Mode Masking vs Full Canvas Mode (GIF Utuh vs Crop Bentuk) */}
              <div style={{ marginBottom: '20px', background: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Mode Tampilan GIF & Avatar:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'crop' as const, label: '✂️ Masking Crop (Potong Bentuk)', desc: 'Foto/GIF dipotong sesuai bentuk lingkaran / sudut melengkung.' },
                    { id: 'full' as const, label: '🖼️ Full Canvas (Bawa GIF Utuh)', desc: 'Seluruh ukuran GIF utuh 100% tanpa sudut terpotong. Border mengitari frame.' },
                  ].map(m => {
                    const active = avatarMasking === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAvatarMasking(m.id)}
                        style={{
                          padding: '10px 12px',
                          background: active ? 'var(--accent-dim)' : 'var(--surface)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '8px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <p style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', margin: '0 0 2px' }}>{m.label}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.3 }}>{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. Shape & Curvature Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Bentuk & Rasio Avatar:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'circle' as const, label: 'Bulat (Circle)' },
                    { id: 'rounded' as const, label: 'Melengkung' },
                    { id: 'square' as const, label: 'Kotak Persegi' },
                    { id: 'wide' as const, label: 'Persegi Panjang' },
                    { id: 'original' as const, label: 'Rasio Asli GIF' },
                    { id: 'custom' as const, label: 'Kustom Radius' },
                  ].map((shape) => {
                    const active = avatarShape === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setAvatarShape(shape.id)}
                        style={{
                          padding: '9px 8px',
                          background: active ? 'var(--accent-dim)' : 'var(--bg)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          color: active ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {shape.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Radius Slider */}
                {(avatarShape === 'custom' || avatarShape === 'rounded') && (
                  <div style={{ marginTop: '12px', background: 'var(--bg)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Tingkat Lengkungan Sudut (Border Radius):
                      </label>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        {avatarRadiusCustom}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={avatarRadiusCustom}
                      onChange={e => {
                        setAvatarRadiusCustom(Number(e.target.value));
                        if (avatarShape !== 'custom' && avatarShape !== 'rounded') {
                          setAvatarShape('custom');
                        }
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      <span>0% (Kotak Tegas)</span>
                      <span>25% (Melengkung)</span>
                      <span>50% (Bulat Sempurna)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Border / Outline Style */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Gaya Garis Tepi (Outline / Border Style):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'none' as const, label: 'Tanpa Garis' },
                    { id: 'solid' as const, label: 'Garis Solid' },
                    { id: 'dashed' as const, label: 'Putus-putus' },
                    { id: 'dotted' as const, label: 'Titik-titik' },
                    { id: 'double' as const, label: 'Garis Ganda' },
                    { id: 'glow' as const, label: 'Neon Glow' },
                  ].map((b) => {
                    const active = avatarBorderStyle === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setAvatarBorderStyle(b.id)}
                        style={{
                          padding: '9px 8px',
                          background: active ? 'var(--accent-dim)' : 'var(--bg)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          color: active ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Border Width & Color */}
              {avatarBorderStyle !== 'none' && (
                <div style={{ marginBottom: '20px', background: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {/* Border Width */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Ketebalan Garis Tepi (Bisa 0px / Tanpa Garis):
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                          {avatarBorderWidth}px
                        </span>
                        {avatarBorderWidth !== 0 && (
                          <button
                            type="button"
                            onClick={() => setAvatarBorderWidth(0)}
                            style={{
                              padding: '2px 6px',
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              color: 'var(--text-dim)',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            Set 0px
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={avatarBorderWidth}
                      onChange={e => setAvatarBorderWidth(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      <span>0px (Tanpa Garis)</span>
                      <span>5px (Sedang)</span>
                      <span>10px (Tebal)</span>
                    </div>
                  </div>

                  {/* Border Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Warna Garis Tepi:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        type="color"
                        value={avatarBorderColor.startsWith('#') && avatarBorderColor.length === 7 ? avatarBorderColor : '#4ade80'}
                        onChange={e => setAvatarBorderColor(e.target.value)}
                        style={{
                          width: '36px', height: '36px', borderRadius: '6px',
                          border: '1px solid var(--border)', background: 'transparent',
                          cursor: 'pointer', padding: '2px'
                        }}
                      />
                      <input
                        type="text"
                        value={avatarBorderColor}
                        onChange={e => setAvatarBorderColor(e.target.value)}
                        placeholder="#4ade80"
                        style={{
                          width: '100px', padding: '8px 10px', background: 'var(--surface)',
                          border: '1px solid var(--border)', borderRadius: '6px',
                          color: 'var(--text)', fontSize: '13px', fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                      {/* Quick color presets */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['#4ade80', '#ffffff', '#38bdf8', '#ec4899', '#eab308', '#a855f7', '#000000'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setAvatarBorderColor(c)}
                            style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: c, border: avatarBorderColor === c ? '2px solid var(--text)' : '1px solid var(--border)',
                              cursor: 'pointer', padding: 0,
                            }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Efek Bayangan / Shadow */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Efek Bayangan (Shadow):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'none' as const, label: 'Tanpa Efek' },
                    { id: 'soft' as const, label: 'Lembut' },
                    { id: 'hard' as const, label: 'Tegas' },
                    { id: 'glow' as const, label: 'Pendar Glow' },
                  ].map((s) => {
                    const active = avatarShadow === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setAvatarShadow(s.id)}
                        style={{
                          padding: '9px 8px',
                          background: active ? 'var(--accent-dim)' : 'var(--bg)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          color: active ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Object Fit Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Mode Potongan / Penyesuaian (Object Fit):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'cover' as const, label: 'Crop Penuh (Cover)' },
                    { id: 'contain' as const, label: 'Tampil Utuh (Contain)' },
                    { id: 'fill' as const, label: 'Regangkan (Fill)' },
                  ].map((fit) => {
                    const active = avatarFit === fit.id;
                    return (
                      <button
                        key={fit.id}
                        type="button"
                        onClick={() => setAvatarFit(fit.id)}
                        style={{
                          padding: '9px 8px',
                          background: active ? 'var(--accent-dim)' : 'var(--bg)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          color: active ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {fit.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Avatar Size Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Ukuran Avatar:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'small' as const, label: 'Kecil (72px)' },
                    { id: 'medium' as const, label: 'Sedang (92px)' },
                    { id: 'large' as const, label: 'Besar (116px)' },
                    { id: 'xlarge' as const, label: 'Ekstra (148px)' },
                  ].map((sz) => {
                    const active = avatarSize === sz.id;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setAvatarSize(sz.id)}
                        style={{
                          padding: '9px 8px',
                          background: active ? 'var(--accent-dim)' : 'var(--bg)',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          color: active ? 'var(--accent)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {sz.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Zoom / Scale Slider */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Perbesaran / Skala Crop (Zoom):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {avatarZoom}%
                    </span>
                    {avatarZoom !== 100 && (
                      <button
                        type="button"
                        onClick={() => setAvatarZoom(100)}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-dim)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Reset (100%)
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={avatarZoom}
                  onChange={e => setAvatarZoom(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>50% (Perkecil)</span>
                  <span>100% (Normal)</span>
                  <span>200% (Perbesar)</span>
                </div>
              </div>

              {/* 8. Posisi Gambar / Crop Pan dengan Interactive Mini-Canvas Langsung */}
              <div style={{ marginBottom: '24px', background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Posisi Geser Gambar (Crop Pan)
                    </label>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                      Drag langsung di layar preview mini atau gunakan D-Pad & slider di bawah.
                    </p>
                  </div>
                  {(avatarOffsetX !== 0 || avatarOffsetY !== 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarOffsetX(0);
                        setAvatarOffsetY(0);
                      }}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text-dim)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Reset Tengah (0, 0)
                    </button>
                  )}
                </div>

                {/* Inline Mini Interactive Preview Box (Drag-to-Pan Enabled) */}
                <div
                  onMouseDown={e => handleDragStart(e.clientX, e.clientY)}
                  onMouseMove={e => handleDragMove(e.clientX, e.clientY)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={e => {
                    const t = e.touches[0];
                    if (t) handleDragStart(t.clientX, t.clientY);
                  }}
                  onTouchMove={e => {
                    const t = e.touches[0];
                    if (t) handleDragMove(t.clientX, t.clientY);
                  }}
                  onTouchEnd={handleDragEnd}
                  style={{
                    width: '100%',
                    minHeight: '170px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
                    border: isDragging ? '2px dashed var(--accent)' : '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    position: 'relative',
                    userSelect: 'none',
                    touchAction: 'none',
                  }}
                >
                  <div style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.04em' }}>
                    LIVE MINI VIEWPORT {isDragging ? '(DRAGGING...)' : ''}
                  </div>
                  <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '10px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>
                    X: {avatarOffsetX}% | Y: {avatarOffsetY}%
                  </div>

                  {renderAvatarPreview(true)}

                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px', margin: '10px 0 0' }}>
                    👆 Klik & tahan untuk menggeser gambar bebas
                  </p>
                </div>

                {/* D-Pad Directional Quick Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 42px)', gridTemplateRows: 'repeat(3, 38px)', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                    <div />
                    <button
                      type="button"
                      onClick={() => setAvatarOffsetY(prev => Math.max(-100, prev - 5))}
                      style={{
                        width: '100%', height: '100%', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
                      }}
                      title="Geser Atas"
                    >
                      ▲
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => setAvatarOffsetX(prev => Math.max(-100, prev - 5))}
                      style={{
                        width: '100%', height: '100%', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
                      }}
                      title="Geser Kiri"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarOffsetX(0);
                        setAvatarOffsetY(0);
                      }}
                      style={{
                        width: '100%', height: '100%', background: 'var(--accent-dim)',
                        border: '1px solid var(--accent)', borderRadius: '6px',
                        color: 'var(--accent)', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      }}
                      title="Tengah (0,0)"
                    >
                      ●
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarOffsetX(prev => Math.min(100, prev + 5))}
                      style={{
                        width: '100%', height: '100%', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
                      }}
                      title="Geser Kanan"
                    >
                      ▶
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => setAvatarOffsetY(prev => Math.min(100, prev + 5))}
                      style={{
                        width: '100%', height: '100%', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
                      }}
                      title="Geser Bawah"
                    >
                      ▼
                    </button>
                    <div />
                  </div>
                </div>

                {/* Horizontal Slider */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Posisi Horizontal (Kiri / Kanan - X):
                    </label>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {avatarOffsetX > 0 ? `+${avatarOffsetX}%` : `${avatarOffsetX}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={avatarOffsetX}
                    onChange={e => setAvatarOffsetX(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    <span>-100% (Kiri)</span>
                    <span>0% (Tengah)</span>
                    <span>+100% (Kanan)</span>
                  </div>
                </div>

                {/* Vertical Slider */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Posisi Vertikal (Atas / Bawah - Y):
                    </label>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {avatarOffsetY > 0 ? `+${avatarOffsetY}%` : `${avatarOffsetY}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={avatarOffsetY}
                    onChange={e => setAvatarOffsetY(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    <span>-100% (Atas)</span>
                    <span>0% (Tengah)</span>
                    <span>+100% (Bawah)</span>
                  </div>
                </div>
              </div>

              {avatarShapeMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px',
                  background: avatarShapeMsg.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(255,77,77,0.1)',
                  border: `1px solid ${avatarShapeMsg.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(255,77,77,0.3)'}`,
                  color: avatarShapeMsg.type === 'success' ? 'var(--accent)' : 'var(--danger)',
                }}>
                  {avatarShapeMsg.text}
                </div>
              )}

              {/* Save Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={handleSaveAvatarSettings}
                  disabled={isPending}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    color: '#000',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Pengaturan Avatar'}
                </button>

                {Boolean(localSettings?.avatar_video_url || avatarVideoUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveMovingAvatar}
                    disabled={isPending}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: '1px solid rgba(255,77,77,0.3)',
                      borderRadius: '8px',
                      color: 'var(--danger)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Hapus Avatar Bergerak
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky on Desktop): Live Profile Preview & Quick Shortcuts */}
          <div className="settings-sticky-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Live Preview
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(74,222,128,0.12)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Aktif
                </span>
              </div>

              {/* Avatar Live Box */}
              <div style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '32px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                {renderAvatarPreview(false)}

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '14px', marginBottom: '2px' }}>
                  {displayName || `@${username}`}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '0 0 10px' }}>
                  @{username}
                </p>
                {currentBio && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px', margin: 0 }}>
                    {currentBio}
                  </p>
                )}
              </div>

              {/* Badges Summary */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                  Mode: <strong style={{ color: 'var(--text)' }}>{avatarMasking === 'full' ? 'GIF Utuh' : 'Crop Masking'}</strong>
                </span>
                <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                  Bentuk: <strong style={{ color: 'var(--text)' }}>{avatarShape}</strong>
                </span>
                <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                  Ukuran: <strong style={{ color: 'var(--text)' }}>{avatarSize}</strong>
                </span>
                <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                  Zoom: <strong style={{ color: 'var(--text)' }}>{avatarZoom}%</strong>
                </span>
                <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)' }}>
                  Garis: <strong style={{ color: 'var(--text)' }}>{avatarBorderStyle === 'none' || avatarBorderWidth === 0 ? '0px' : `${avatarBorderWidth}px`}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <a
                  href={`/@${username}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    background: 'var(--accent)',
                    color: '#000',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>Buka Profil Publik</span>
                  <span>↗</span>
                </a>
                <button
                  type="button"
                  onClick={copyProfileLink}
                  style={{
                    padding: '9px 16px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Salin Tautan Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Mini Live Preview (Rendered on Small Viewports < 1024px) */}
      {activeTab === 'profile' && (
        <div
          className="mobile-avatar-floating-badge"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            zIndex: 45,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            borderRadius: '30px',
            padding: '6px 14px 6px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderAvatarPreview(true)}
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Live Avatar
            </p>
            <p style={{ fontSize: '10px', color: 'var(--accent)', margin: 0, fontFamily: 'monospace' }}>
              X:{avatarOffsetX}% Y:{avatarOffsetY}%
            </p>
          </div>
        </div>
      )}

      {/* SUB-SETTING 2: SEO & METADATA (Responsive 2-Column Desktop Grid) */}
      {activeTab === 'seo' && (
        <div className="settings-desktop-grid">
          {/* Left Column: Form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Kustom SEO & Open Graph Meta</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Atur bagaimana profil kamu tampil di hasil pencarian Google dan saat dibagikan ke WhatsApp, Telegram, atau Twitter.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>JUDUL HALAMAN (TITLE)</label>
                <input
                  type="text"
                  placeholder={`Contoh: ${displayName || username} | Biolink Resmi`}
                  value={localSettings.seo_meta?.title || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, seo_meta: { ...(prev.seo_meta || {}), title: e.target.value } }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>DESKRIPSI META (DESCRIPTION)</label>
                <textarea
                  placeholder="Deskripsi singkat profil untuk mesin pencari..."
                  value={localSettings.seo_meta?.description || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, seo_meta: { ...(prev.seo_meta || {}), description: e.target.value } }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>GAMBAR PRATINJAU SOSIAL (OG IMAGE URL)</label>
                <input
                  type="url"
                  placeholder="https://domain.com/og-banner.jpg"
                  value={localSettings.seo_meta?.og_image_url || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, seo_meta: { ...(prev.seo_meta || {}), og_image_url: e.target.value } }))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Kosongkan jika ingin memakai foto profil sebagai gambar pratinjau bawaan.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>KATA KUNCI (KEYWORDS)</label>
                <input
                  type="text"
                  placeholder="biolink, portfolio, creator, indonesia"
                  value={localSettings.seo_meta?.meta_keywords || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, seo_meta: { ...(prev.seo_meta || {}), meta_keywords: e.target.value } }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {seoMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginTop: '16px', fontSize: '13px',
                background: seoMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
                border: `1px solid ${seoMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
                color: seoMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>{seoMsg.text}</div>
            )}

            <button
              type="button"
              onClick={handleSaveSeo}
              disabled={isPending}
              style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Kustom SEO'}
            </button>
          </div>

          {/* Right Column: Sticky Google SERP & Social Share Preview */}
          <div className="settings-sticky-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Google Search Snippet Preview */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px' }}>🔍</span>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  Pratinjau Hasil Pencarian Google
                </h3>
              </div>
              <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', padding: '16px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000' }}>🌿</div>
                  <span style={{ fontSize: '12px', color: '#bdc1c6' }}>pohonlink.id &gt; @{username}</span>
                </div>
                <h4 style={{ fontSize: '16px', color: '#8ab4f8', margin: '2px 0 6px', fontWeight: 400, textDecoration: 'underline', cursor: 'pointer' }}>
                  {localSettings.seo_meta?.title || `${displayName || username} | Pohonlink`}
                </h4>
                <p style={{ fontSize: '13px', color: '#bdc1c6', margin: 0, lineHeight: 1.4 }}>
                  {localSettings.seo_meta?.description || bio || `Temukan tautan dan profil lengkap @${username} di platform Pohonlink.`}
                </p>
              </div>
            </div>

            {/* Social Share Card Preview */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px' }}>📱</span>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  Pratinjau Bagikan di WhatsApp / Medsos
                </h3>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                {localSettings.seo_meta?.og_image_url || avatarUrl ? (
                  <div style={{ width: '100%', height: '140px', background: '#222', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={localSettings.seo_meta?.og_image_url || avatarUrl || ''}
                      alt="OG Banner"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100px', background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '28px' }}>
                    🌿
                  </div>
                )}
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>
                    pohonlink.id
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
                    {localSettings.seo_meta?.title || `${displayName || username} | Pohonlink`}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineClamp: 2, overflow: 'hidden' }}>
                    {localSettings.seo_meta?.description || bio || 'Lihat dan bagikan profil biolink saya.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SETTING 3: PELACAKAN & PIXEL (Responsive Equal 2-Column Grid) */}
      {activeTab === 'pixels' && (
        <div className="settings-equal-2col">
          {/* Card 1: Meta & TikTok Pixel */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Pixel Iklan Media Sosial</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Retargeting pengunjung profil melalui Meta Ads (Facebook/Instagram) dan TikTok Ads.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>META PIXEL ID (FACEBOOK/IG)</label>
                <input
                  type="text"
                  placeholder="Contoh: 123456789012345"
                  value={localSettings.marketing_pixels?.meta_pixel_id || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, marketing_pixels: { ...(prev.marketing_pixels || {}), meta_pixel_id: e.target.value } }))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Otomatis memicu event PageView dan Klik Link ke Facebook Ads Manager.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>TIKTOK PIXEL ID</label>
                <input
                  type="text"
                  placeholder="Contoh: CXXXXXXXXXXXXXX"
                  value={localSettings.marketing_pixels?.tiktok_pixel_id || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, marketing_pixels: { ...(prev.marketing_pixels || {}), tiktok_pixel_id: e.target.value } }))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Terkoneksi dengan TikTok Ads Event Manager.</p>
              </div>
            </div>

            {pixelsMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginTop: '16px', fontSize: '13px',
                background: pixelsMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
                border: `1px solid ${pixelsMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
                color: pixelsMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>{pixelsMsg.text}</div>
            )}

            <button
              type="button"
              onClick={handleSavePixels}
              disabled={isPending}
              style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Tracking Pixel'}
            </button>
          </div>

          {/* Card 2: GA4 & Pinterest Tag */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Analitik & Tag Web</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Pelacakan statistik audiens melalui Google Analytics 4 dan Pinterest Tag.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>GOOGLE ANALYTICS 4 (MEASUREMENT ID)</label>
                <input
                  type="text"
                  placeholder="Contoh: G-XXXXXXXXXX"
                  value={localSettings.marketing_pixels?.ga4_id || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, marketing_pixels: { ...(prev.marketing_pixels || {}), ga4_id: e.target.value } }))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Kirim metrik pengunjung langsung ke dashboard Google Analytics Anda.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>PINTEREST TAG ID</label>
                <input
                  type="text"
                  placeholder="Contoh: 261XXXXXXXXXX"
                  value={localSettings.marketing_pixels?.pinterest_tag_id || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, marketing_pixels: { ...(prev.marketing_pixels || {}), pinterest_tag_id: e.target.value } }))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Lacak konversi dari audiens Pinterest.</p>
              </div>

              {/* Pixel Helper Info Box */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginTop: '6px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', margin: '0 0 4px' }}>💡 Cara Kerja Pelacakan</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                  Pixel akan diinjeksi secara asynchronous di profil publik Anda tanpa memperlambat waktu muat halaman.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SETTING 4: KONTAK & VCARD (Responsive 2-Column Desktop Grid) */}
      {activeTab === 'vcard' && (
        <div className="settings-desktop-grid">
          {/* Left Column: Form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Kontak Digital vCard (.vcf)</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Tampilkan tombol &quot;Simpan Kontak&quot; di profil biolink agar pengunjung dapat menyimpan nomor dan data kontak langsung ke buku telepon mereka.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ToggleRow
                label="Tampilkan Tombol Simpan Kontak"
                desc="Munculkan tombol download file vCard digital di profil publik."
                checked={Boolean(localSettings.vcard?.enabled)}
                onChange={val => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || {}), enabled: val } }))}
              />

              {localSettings.vcard?.enabled && (
                <div className="responsive-grid-2col" style={{ marginTop: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>NAMA LENGKAP</label>
                    <input
                      type="text"
                      placeholder={displayName || 'Nama kamu'}
                      value={localSettings.vcard?.full_name || ''}
                      onChange={e => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || { enabled: true }), full_name: e.target.value } }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>NOMOR TELEPON / WA</label>
                    <input
                      type="tel"
                      placeholder="+628123456789"
                      value={localSettings.vcard?.phone || ''}
                      onChange={e => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || { enabled: true }), phone: e.target.value } }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>EMAIL KONTAK</label>
                    <input
                      type="email"
                      placeholder={email}
                      value={localSettings.vcard?.email || ''}
                      onChange={e => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || { enabled: true }), email: e.target.value } }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>PERUSAHAAN / BRAND</label>
                    <input
                      type="text"
                      placeholder="DGXO"
                      value={localSettings.vcard?.company || ''}
                      onChange={e => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || { enabled: true }), company: e.target.value } }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>JABATAN / PROFESI</label>
                    <input
                      type="text"
                      placeholder="Software Engineer"
                      value={localSettings.vcard?.job_title || ''}
                      onChange={e => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || { enabled: true }), job_title: e.target.value } }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>CATATAN TAMBAHAN</label>
                    <input
                      type="text"
                      placeholder="Bio singkat kontak"
                      value={localSettings.vcard?.note || ''}
                      onChange={e => setLocalSettings(prev => ({ ...prev, vcard: { ...(prev.vcard || { enabled: true }), note: e.target.value } }))}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}
            </div>

            {vcardMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginTop: '16px', fontSize: '13px',
                background: vcardMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
                border: `1px solid ${vcardMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
                color: vcardMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>{vcardMsg.text}</div>
            )}

            <button
              type="button"
              onClick={handleSaveVCard}
              disabled={isPending}
              style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan vCard'}
            </button>
          </div>

          {/* Right Column: QR Code & vCard Preview */}
          <div className="settings-sticky-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <QRCodeCard
              url={typeof window !== 'undefined' ? `${window.location.origin}/@${username}` : `https://${host || 'pohonlink.id'}/@${username}`}
              username={username}
            />
          </div>
        </div>
      )}

      {/* SUB-SETTING 5: OTOMASI & AI (Responsive Equal 2-Column Grid) */}
      {activeTab === 'automation' && (
        <div className="settings-equal-2col">
          {/* Card 1: Instagram & TikTok Auto-DM */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Instagram & TikTok Auto-DM</h2>
              <button
                type="button"
                disabled={isAutoDmAiLoading}
                onClick={handleGenerateAutoDmAI}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                {isAutoDmAiLoading ? 'Memproses AI...' : '✨ Buat Pesan AI'}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Konfigurasi balasan otomatis saat audiens mengetik keyword di kolom komentar postingan Instagram / TikTok kamu.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ToggleRow
                label="Aktifkan Integrasi Auto-DM"
                desc="Gunakan template ini untuk otomasi ManyChat, webhook, atau balas DM otomatis."
                checked={Boolean(localSettings.auto_dm?.enabled)}
                onChange={val => setLocalSettings(prev => ({ ...prev, auto_dm: { ...(prev.auto_dm || { keyword: 'LINK', message: '' }), enabled: val } }))}
              />

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>KEYWORD PEMICU (TRIGGER WORD)</label>
                <input
                  type="text"
                  placeholder="Contoh: LINK, MAU, POHON"
                  value={localSettings.auto_dm?.keyword || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, auto_dm: { ...(prev.auto_dm || { enabled: true, message: '' }), keyword: e.target.value } }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>TEMPLATE PESAN BALASAN DM</label>
                <textarea
                  placeholder="Halo! Ini tautan yang kamu minta: https://..."
                  value={localSettings.auto_dm?.message || ''}
                  onChange={e => setLocalSettings(prev => ({ ...prev, auto_dm: { ...(prev.auto_dm || { enabled: true, keyword: 'LINK' }), message: e.target.value } }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>

            {autoDmMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginTop: '14px', fontSize: '13px',
                background: autoDmMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
                border: `1px solid ${autoDmMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
                color: autoDmMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>{autoDmMsg.text}</div>
            )}

            <button
              type="button"
              onClick={handleSaveAutoDm}
              disabled={isPending}
              style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Auto-DM'}
            </button>
          </div>

          {/* Card 2: Auto Redirect / Forwarding */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Pengalihan Otomatis (Forwarding)</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Otomatis mengalihkan pengunjung profil langsung ke URL eksternal (misalnya saat kampanye promo kilat atau peluncuran produk).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ToggleRow
                label="Aktifkan Auto Redirect"
                desc="Pengunjung yang membuka profil Anda akan langsung diarahkan ke URL target."
                checked={Boolean(localSettings.auto_redirect?.enabled)}
                onChange={val => setLocalSettings(prev => ({ ...prev, auto_redirect: { ...(prev.auto_redirect || { url: '' }), enabled: val } }))}
              />
              {localSettings.auto_redirect?.enabled && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>TARGET URL PENGALIHAN</label>
                  <input
                    type="url"
                    placeholder="https://websitekamu.com/promo"
                    value={localSettings.auto_redirect?.url || ''}
                    onChange={e => setLocalSettings(prev => ({ ...prev, auto_redirect: { ...(prev.auto_redirect || { enabled: true }), url: e.target.value } }))}
                    style={inputStyle}
                  />
                </div>
              )}

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginTop: '8px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>⚡ Tips Kampanye</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                  Parameter UTM pada URL biolink Anda akan diteruskan secara otomatis ke URL target.
                </p>
              </div>
            </div>

            {redirectMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginTop: '14px', fontSize: '13px',
                background: redirectMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,77,77,0.1)',
                border: `1px solid ${redirectMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,77,77,0.3)'}`,
                color: redirectMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              }}>{redirectMsg.text}</div>
            )}

            <button
              type="button"
              onClick={handleSaveAutoRedirect}
              disabled={isPending}
              style={{ marginTop: '16px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Auto Redirect'}
            </button>
          </div>
        </div>
      )}

      {/* SUB-SETTING 6: MEDIA SOSIAL (Responsive 2-Column Desktop Grid) */}
      {activeTab === 'socials' && (
        <div className="settings-desktop-grid">
          {/* Left Column: Form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Ikon Media Sosial</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Tampilkan ikon media sosial di profil biolink kamu.</p>

            {/* Social Position Switcher */}
            <div style={{ marginBottom: '20px' }}>
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
              style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Media Sosial'}
            </button>
          </div>

          {/* Right Column: Sticky Social Icons Live Bar */}
          <div className="settings-sticky-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Pratinjau Ikon Medsos
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
                  Posisi: {(localSettings.social_position || 'top') === 'top' ? 'Atas' : 'Bawah'}
                </span>
              </div>

              {/* Live Render of Active Socials */}
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '24px 16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                minHeight: '80px',
              }}>
                {Object.entries(localSettings.social_links || {}).filter(([, val]) => Boolean(val?.trim())).length > 0 ? (
                  Object.entries(localSettings.social_links || {}).map(([platform, val]) => {
                    if (!val?.trim()) return null;
                    return (
                      <div
                        key={platform}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                        title={platform}
                      >
                        <SocialIcon platform={platform} size={20} color="currentColor" />
                      </div>
                    );
                  })
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                    Belum ada tautan media sosial yang diisi
                  </p>
                )}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '16px', margin: '16px 0 0' }}>
                Ikon akan otomatis disesuaikan dengan skema warna tema profil yang Anda pilih.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SETTING 7: PREFERENSI & DATA (Responsive Equal 2-Column Grid) */}
      {activeTab === 'preferences' && (
        <div className="settings-equal-2col">
          {/* Left Column: Preferences */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Preferensi Halaman Profil</h2>
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

          {/* Right Column: Backup & Restore + Delete Account */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            {/* Delete Account */}
            <DeleteAccountSection />
          </div>
        </div>
      )}

      {/* Modals */}
      {showAiBioModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              ✨ AI Bio Generator
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '14px' }}>
              Masukkan kata kunci niche atau profesi kamu, AI akan menghasilkan 3 opsi Bio siap pakai.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <input
                type="text"
                value={aiBioPrompt}
                onChange={e => setAiBioPrompt(e.target.value)}
                placeholder="Contoh: Digital artist, gamer, pembuat konten Minecraft"
                style={inputStyle}
              />
              <select
                value={aiBioTone}
                onChange={e => setAiBioTone(e.target.value)}
                style={inputStyle}
              >
                <option value="modern & engaging">🔥 Modern & Engaging</option>
                <option value="profesional & elegan">💼 Profesional & Elegan</option>
                <option value="santai & ramah">☕ Santai & Ramah</option>
                <option value="kreatif & unik">🎨 Kreatif & Unik</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isAiBioLoading || !aiBioPrompt.trim()}
              onClick={handleGenerateAiBio}
              style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: isAiBioLoading ? 'not-allowed' : 'pointer', marginBottom: '14px' }}
            >
              {isAiBioLoading ? 'Sedang Meracik Bio...' : 'Generate Bio Sekarang'}
            </button>

            {generatedBios.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Pilih salah satu Bio:</span>
                {generatedBios.map((b, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectBioOption(b)}
                    style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left', color: 'var(--text)', fontSize: '13px', cursor: 'pointer', lineHeight: 1.4 }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAiBioModal(false)}
              style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

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

      {/* Remove Avatar Confirmation */}
      <ConfirmDialog
        isOpen={showRemoveAvatarConfirm}
        title="Hapus Foto Profil?"
        message="Foto profil kamu akan dihapus dan digantikan oleh ikon default."
        confirmLabel="Ya, Hapus Foto"
        cancelLabel="Batal"
        isDanger={true}
        isLoading={isPending}
        onConfirm={handleConfirmRemoveAvatar}
        onCancel={() => setShowRemoveAvatarConfirm(false)}
      />

      {/* Import Backup Overwrite Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(pendingImportData)}
        title="Import Cadangan Data?"
        message="Data tautan dan profil saat ini akan ditimpa dengan data dari file cadangan yang kamu pilih. Pastikan kamu sudah mencadangkan data terkini."
        confirmLabel="Ya, Timpa & Import"
        cancelLabel="Batal"
        isDanger={true}
        isLoading={isPending}
        onConfirm={handleConfirmImport}
        onCancel={() => setPendingImportData(null)}
      />

      {/* Floating Toast Feedback */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
