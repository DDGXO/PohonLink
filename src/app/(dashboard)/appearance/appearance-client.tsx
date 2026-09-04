'use client';

import { useState, useTransition, useRef } from 'react';
import { updateTheme, uploadBackground, removeBackground } from '@/app/actions';
import type { ThemeConfig } from '@/types/database';
import ImageCropperModal from '@/components/image-cropper-modal';
import ConfirmDialog from '@/components/confirm-dialog';
import Toast from '@/components/toast';

const VIDEO_PRESETS = [
  { name: 'Nebula Space', label: '🌌 Nebula', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4' },
  { name: 'Rainy Dusk', label: '🌧️ Hujan', url: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-seen-up-close-18312-large.mp4' },
  { name: 'Cyber Neon', label: '⚡ Neon Laser', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-animation-32508-large.mp4' },
  { name: 'Forest Mist', label: '🌲 Hutan Kabut', url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
];

const ANIMATED_BG_TEMPLATES = [
  { id: 'matrix' as const, label: '🟩 Matrix Rain', desc: 'Hujan kode digital hijau Matrix' },
  { id: 'ascii_aquarium' as const, label: '🐟 ASCII Aquarium', desc: 'Akuarium ikan ASCII berenang' },
  { id: 'starfield' as const, label: '✨ Starfield 3D', desc: 'Galaksi bintang 3D hyperspace' },
  { id: 'particles' as const, label: '🕸️ Particle Mesh', desc: 'Jaringan partikel konstelasi dinamis' },
  { id: 'synthwave' as const, label: '🌆 Synthwave 80s', desc: 'Grid neon retro perspektif senja' },
  { id: 'aura' as const, label: '🔮 Ambient Aura', desc: 'Cahaya aura lembut mengapung' },
  { id: 'cyber_rain' as const, label: '🌧️ Cyberpunk Rain', desc: 'Hujan neon cyan dengan riak air' },
  { id: 'galaxy_spiral' as const, label: '🌌 Spiral Galaxy', desc: 'Pusaran galaksi bintang kosmik berputar' },
  { id: 'cyber_waves' as const, label: '🧬 Cyber Waveform', desc: 'Pita gelombang neon berosilasi' },
  { id: 'retro_terminal' as const, label: '👾 Retro Terminal', desc: 'Layar hacker CRT scanline berkedip' },
  { id: 'neon_embers' as const, label: '🔥 Neon Embers', desc: 'Percikan api neon & kunang-kunang' },
];

const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', dir: 'to_bottom' as const, c1: '#ff512f', c2: '#dd2476' },
  { name: 'Cyber Aurora', dir: 'to_diagonal' as const, c1: '#00f2fe', c2: '#4facfe' },
  { name: 'Midnight Velvet', dir: 'to_bottom' as const, c1: '#0f0c29', c2: '#302b63' },
  { name: 'Neon Dusk', dir: 'radial' as const, c1: '#ec4899', c2: '#18181b' },
  { name: 'Emerald Forest', dir: 'to_bottom' as const, c1: '#052e16', c2: '#14532d' },
];

const BUTTON_STYLE_OPTIONS = [
  { id: 'solid' as const, label: '⬛ Solid Fill', desc: 'Latar pekat standar' },
  { id: 'outline' as const, label: '🔲 Outline Garis', desc: 'Border garis transparan' },
  { id: 'glass' as const, label: '🪟 Glassmorphism', desc: 'Efek kaca blur' },
  { id: 'hard_shadow' as const, label: '🧱 Hard Shadow (3D)', desc: 'Bayangan retro pop tegas' },
  { id: 'soft_shadow' as const, label: '✨ Soft Shadow / Glow', desc: 'Bayangan lembut melayang' },
];

const LAYOUT_OPTIONS = [
  { id: 'list' as const, label: '📋 Stack Klasik', desc: 'Tumpukan link vertikal penuh' },
  { id: 'grid' as const, label: '▦ Grid Kompak', desc: 'Grid 2 kolom modern' },
  { id: 'carousel' as const, label: '🎠 Carousel Slider', desc: 'Kartu geser horizontal' },
];

const PRESETS: { name: string; label: string; config: Partial<ThemeConfig> }[] = [
  { name: 'default', label: '🌑 Dark', config: { bg_value: '#0a0a0a', card_bg: '#161616', text_color: '#f0ece4' } },
  { name: 'light', label: '☀️ Light', config: { bg_value: '#f5f5f0', card_bg: '#ffffff', text_color: '#111111' } },
  { name: 'forest', label: '🌲 Forest', config: { bg_value: '#0d1f0d', card_bg: '#162516', text_color: '#d4f5d4' } },
  { name: 'ocean', label: '🌊 Ocean', config: { bg_value: '#050d1f', card_bg: '#0d1a2e', text_color: '#d4eaf5' } },
  { name: 'purple', label: '💜 Purple', config: { bg_value: '#0d0514', card_bg: '#1a0d24', text_color: '#f0d4f5' } },
];

const RADIUS_OPTIONS = [
  { label: 'Sharp', value: '4px' },
  { label: 'Rounded', value: '12px' },
  { label: 'Pill', value: '9999px' },
];

const CSS_TEMPLATES = [
  {
    name: 'Glow Neon',
    css: `/* Neon Glow Hover Effect */
.pohon-button {
  transition: all 0.25s ease !important;
}
.pohon-button:hover {
  transform: translateY(-3px) scale(1.02) !important;
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.6), 0 0 30px rgba(74, 222, 128, 0.3) !important;
  border-color: #4ade80 !important;
}`,
  },
  {
    name: 'Glassmorphism',
    css: `/* Glassmorphism Blur Effect */
.pohon-button {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
}
.pohon-button:hover {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}`,
  },
  {
    name: 'Gradient Modern',
    css: `/* Gradient Glow */
.pohon-button {
  background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}
.pohon-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.55) !important;
}`,
  },
  {
    name: 'Retro 3D',
    css: `/* Retro 3D Shadow */
.pohon-button {
  box-shadow: 4px 4px 0px #3b82f6 !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}
.pohon-button:hover {
  transform: translate(-2px, -2px) !important;
  box-shadow: 6px 6px 0px #a855f7 !important;
}`,
  },
];

const HTML_TEMPLATES = [
  {
    name: 'Banner Pengumuman',
    html: '<div style="background: rgba(74, 222, 128, 0.12); border: 1px solid #4ade80; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; text-align: center; font-size: 13px; font-weight: 500;">\n  📢 Selamat datang di profil resmi saya!\n</div>',
  },
  {
    name: 'Spotify Player',
    html: '<iframe style="border-radius:12px; margin-bottom: 16px;" src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator" width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
  },
  {
    name: 'Badge Status',
    html: '<div style="display: flex; justify-content: center; margin-bottom: 16px;">\n  <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 5px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600;">🟢 Online & Siap Kolaborasi</span>\n</div>',
  },
  {
    name: 'YouTube Embed',
    html: '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin-bottom: 16px;">\n  <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>\n</div>',
  },
];

interface Props {
  theme: ThemeConfig | null | undefined;
  bgUrl: string | null;
  username: string;
  userId: string;
}

const DEFAULT_THEME: ThemeConfig = {
  preset: 'default',
  bg_type: 'color',
  bg_value: '#0a0a0a',
  card_bg: '#161616',
  text_color: '#f0ece4',
  btn_radius: '8px',
  btn_style: 'solid',
  font: 'Inter',
  custom_css: '',
};

export default function AppearanceClient({ theme: initialTheme, bgUrl: initialBgUrl, username }: Props) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme ?? DEFAULT_THEME);
  const [bgUrl, setBgUrl] = useState<string | null>(initialBgUrl);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' | 'danger' } | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [cropBgSrc, setCropBgSrc] = useState<string | null>(null);
  const [showRemoveBgConfirm, setShowRemoveBgConfirm] = useState(false);

  const refreshPreview = () => {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTheme(prev => ({ ...prev, ...preset.config, preset: preset.name }));
    setToast({ message: `Preset tema "${preset.label}" diterapkan!`, type: 'info' });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTheme(theme);
      if (result?.error) {
        setToast({ message: result.error, type: 'error' });
      } else {
        setSaved(true);
        setToast({ message: 'Tampilan profil berhasil disimpan!', type: 'success' });
        refreshPreview();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const handleBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setToast({ message: 'Ukuran file maksimal 8MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropBgSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePerformCroppedBg = (blob: Blob) => {
    setCropBgSrc(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('background', blob, 'background.webp');
      const res = await uploadBackground(fd);
      if (res?.error) {
        setToast({ message: res.error, type: 'error' });
      } else if (res?.bg_url) {
        setBgUrl(res.bg_url);
        setTheme(prev => ({ ...prev, bg_type: 'image' }));
        setToast({ message: 'Gambar latar berhasil diunggah!', type: 'success' });
        refreshPreview();
      }
    });
  };

  const handleRemoveBg = () => {
    setShowRemoveBgConfirm(true);
  };

  const handleConfirmRemoveBg = () => {
    setShowRemoveBgConfirm(false);
    startTransition(async () => {
      const res = await removeBackground();
      if (res?.error) {
        setToast({ message: res.error, type: 'error' });
      } else {
        setBgUrl(null);
        setTheme(prev => ({ ...prev, bg_type: 'color' }));
        setToast({ message: 'Gambar latar berhasil dihapus!', type: 'success' });
        refreshPreview();
      }
    });
  };


  return (
    <div className="responsive-grid-split">
      {/* Settings Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Presets */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Preset Tema</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '8px 16px',
                  background: theme.preset === preset.name ? 'var(--accent)' : 'var(--bg)',
                  color: theme.preset === preset.name ? '#000' : 'var(--text-muted)',
                  border: `1px solid ${theme.preset === preset.name ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >{preset.label}</button>
            ))}
          </div>
        </div>

        {/* Custom Background (Color / Gradient / Image with Crop / Video / Animated) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Tipe Latar Belakang</h3>
          
          {/* Mode Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {[
              { type: 'color' as const, label: '🎨 Warna' },
              { type: 'gradient' as const, label: '🌈 Gradient' },
              { type: 'image' as const, label: '🖼️ Gambar' },
              { type: 'video' as const, label: '🎬 Video' },
              { type: 'animated' as const, label: '✨ Efek' },
            ].map(tab => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setTheme(prev => ({ ...prev, bg_type: tab.type, animated_bg: prev.animated_bg || 'matrix' }))}
                style={{
                  padding: '9px 4px',
                  background: theme.bg_type === tab.type ? 'var(--accent)' : 'var(--bg)',
                  color: theme.bg_type === tab.type ? '#000' : 'var(--text-muted)',
                  border: `1px solid ${theme.bg_type === tab.type ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mode: Gradient */}
          {theme.bg_type === 'gradient' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Arah Gradient:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'to_bottom' as const, label: 'Bawah ↓' },
                    { id: 'to_top' as const, label: 'Atas ↑' },
                    { id: 'to_diagonal' as const, label: 'Diagonal ↗' },
                    { id: 'radial' as const, label: 'Radial 🔘' },
                  ].map(dir => (
                    <button
                      key={dir.id}
                      type="button"
                      onClick={() => setTheme(prev => ({ ...prev, gradient_direction: dir.id }))}
                      style={{
                        padding: '8px 4px',
                        background: (theme.gradient_direction || 'to_bottom') === dir.id ? 'var(--accent)' : 'var(--bg)',
                        color: (theme.gradient_direction || 'to_bottom') === dir.id ? '#000' : 'var(--text-muted)',
                        border: `1px solid ${(theme.gradient_direction || 'to_bottom') === dir.id ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Warna Awal (Color 1)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={theme.gradient_color1 || '#ff512f'}
                      onChange={(e) => setTheme(prev => ({ ...prev, gradient_color1: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px' }}
                    />
                    <input
                      type="color"
                      value={theme.gradient_color1 || '#ff512f'}
                      onChange={(e) => setTheme(prev => ({ ...prev, gradient_color1: e.target.value }))}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: '2px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Warna Akhir (Color 2)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={theme.gradient_color2 || '#dd2476'}
                      onChange={(e) => setTheme(prev => ({ ...prev, gradient_color2: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px' }}
                    />
                    <input
                      type="color"
                      value={theme.gradient_color2 || '#dd2476'}
                      onChange={(e) => setTheme(prev => ({ ...prev, gradient_color2: e.target.value }))}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: '2px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Preset Gradients */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>Preset Gradient Populer:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {GRADIENT_PRESETS.map((gp) => (
                    <button
                      key={gp.name}
                      type="button"
                      onClick={() => setTheme(prev => ({ ...prev, gradient_direction: gp.dir, gradient_color1: gp.c1, gradient_color2: gp.c2 }))}
                      style={{
                        padding: '6px 12px',
                        background: `linear-gradient(135deg, ${gp.c1}, ${gp.c2})`,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      }}
                    >
                      {gp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode: Animated Effects */}
          {theme.bg_type === 'animated' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Pilih Template Efek Animasi (Canvas 60FPS):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {ANIMATED_BG_TEMPLATES.map((tmpl) => {
                  const active = theme.animated_bg === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setTheme(prev => ({ ...prev, bg_type: 'animated', animated_bg: tmpl.id }))}
                      style={{
                        padding: '12px',
                        background: active ? 'var(--accent-dim)' : 'var(--bg)',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <p style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', margin: '0 0 4px' }}>
                        {tmpl.label}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>
                        {tmpl.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode: Image */}
          {theme.bg_type === 'image' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {bgUrl && (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '8px',
                    backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid var(--border)'
                  }} />
                )}
                <input type="file" ref={bgInputRef} onChange={handleBgFileSelect} accept="image/*" style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => bgInputRef.current?.click()}
                    disabled={isPending}
                    style={{ padding: '8px 16px', background: 'var(--accent)', color: '#000', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isPending ? 'Mengunggah...' : bgUrl ? 'Ganti & Crop Gambar' : 'Unggah & Crop Gambar'}
                  </button>
                  {bgUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveBg}
                      disabled={isPending}
                      style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>JPG, PNG, WEBP. Maksimal 8MB. Gambar akan dipotong secara proporsional.</p>
            </div>
          )}

          {/* Mode: Video */}
          {theme.bg_type === 'video' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  URL Video (.mp4 / .webm langsung)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/ambient-loop.mp4"
                  value={theme.video_url || ''}
                  onChange={(e) => setTheme(prev => ({ ...prev, video_url: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Preset Video Ambient:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {VIDEO_PRESETS.map((vp) => (
                    <button
                      key={vp.name}
                      type="button"
                      onClick={() => setTheme(prev => ({ ...prev, bg_type: 'video', video_url: vp.url }))}
                      style={{
                        padding: '8px 10px',
                        background: theme.video_url === vp.url ? 'var(--accent-dim)' : 'var(--bg)',
                        border: `1px solid ${theme.video_url === vp.url ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '6px',
                        color: theme.video_url === vp.url ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {vp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode: Color */}
          {theme.bg_type === 'color' && (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
              Warna latar solid diatur pada panel &quot;Warna&quot; di bawah ini.
            </p>
          )}
        </div>

        {/* Layout Selection */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Tata Letak Konten (Layout)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {LAYOUT_OPTIONS.map(opt => {
              const active = (theme.layout_type || 'list') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(prev => ({ ...prev, layout_type: opt.id }))}
                  style={{
                    padding: '14px 10px',
                    background: active ? 'var(--accent-dim)' : 'var(--bg)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', margin: '0 0 4px' }}>{opt.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Button Style Types */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Gaya & Efek Tombol</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
            {BUTTON_STYLE_OPTIONS.map(btnOpt => {
              const active = (theme.btn_style || 'solid') === btnOpt.id;
              return (
                <button
                  key={btnOpt.id}
                  type="button"
                  onClick={() => setTheme(prev => ({ ...prev, btn_style: btnOpt.id }))}
                  style={{
                    padding: '12px',
                    background: active ? 'var(--accent-dim)' : 'var(--bg)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', margin: '0 0 4px' }}>{btnOpt.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>{btnOpt.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Glassmorphism settings if glass is chosen */}
          {theme.btn_style === 'glass' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Tingkat Transparansi Kaca (Opacity)</label>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{theme.btn_glass_opacity !== undefined ? theme.btn_glass_opacity : 15}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={theme.btn_glass_opacity !== undefined ? theme.btn_glass_opacity : 15}
                  onChange={(e) => setTheme(prev => ({ ...prev, btn_glass_opacity: Number(e.target.value) }))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <label style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Ketajaman Blur Latar (Backdrop Blur)</label>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{theme.btn_glass_blur !== undefined ? theme.btn_glass_blur : 16}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={theme.btn_glass_blur !== undefined ? theme.btn_glass_blur : 16}
                  onChange={(e) => setTheme(prev => ({ ...prev, btn_glass_blur: Number(e.target.value) }))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '4px 0 0' }}>
                💡 Warna kaca (tint) mengikuti <b>Warna Tombol</b> di panel bawah.
              </p>
            </div>
          )}

          {/* Shadow color picker if hard_shadow or soft_shadow */}
          {(theme.btn_style === 'hard_shadow' || theme.btn_style === 'soft_shadow') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Warna Bayangan Tombol (Shadow)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  value={theme.btn_shadow_color || '#3b82f6'}
                  onChange={(e) => setTheme(prev => ({ ...prev, btn_shadow_color: e.target.value }))}
                  style={{ width: '80px', padding: '5px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px' }}
                />
                <input
                  type="color"
                  value={theme.btn_shadow_color || '#3b82f6'}
                  onChange={(e) => setTheme(prev => ({ ...prev, btn_shadow_color: e.target.value }))}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: '2px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Colors */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Warna</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Warna Latar (jika tanpa gambar/gradient)', key: 'bg_value' as keyof ThemeConfig },
              { label: 'Warna Tombol', key: 'card_bg' as keyof ThemeConfig },
              { label: 'Warna Teks', key: 'text_color' as keyof ThemeConfig },
            ].map(({ label, key }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    value={String(theme[key] || '')}
                    onChange={(e) => setTheme(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{
                      width: '90px', padding: '6px 10px', background: 'var(--bg)',
                      border: '1px solid var(--border)', borderRadius: '6px',
                      color: 'var(--text)', fontSize: '12px', outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                  <input
                    type="color"
                    value={String(theme[key] || '#000000')}
                    onChange={(e) => setTheme(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: '2px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Sudut Tombol (Radius)</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {RADIUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(prev => ({ ...prev, btn_radius: opt.value }))}
                style={{
                  flex: 1, padding: '10px',
                  background: theme.btn_radius === opt.value ? 'var(--accent)' : 'var(--bg)',
                  color: theme.btn_radius === opt.value ? '#000' : 'var(--text-muted)',
                  border: `1px solid ${theme.btn_radius === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Custom CSS Section */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Custom CSS</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target: .pohon-button, .pohon-name, .pohon-bio, dll.</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            Pilih template siap pakai atau ketik CSS kustom kamu sendiri di bawah:
          </p>

          {/* Template Quick Insert */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {CSS_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => setTheme(prev => ({ ...prev, custom_css: tmpl.css }))}
                style={{
                  padding: '5px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--accent)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                + Template {tmpl.name}
              </button>
            ))}
            {theme.custom_css && (
              <button
                type="button"
                onClick={() => setTheme(prev => ({ ...prev, custom_css: '' }))}
                style={{
                  padding: '5px 10px',
                  background: 'transparent',
                  border: '1px solid rgba(255,77,77,0.3)',
                  borderRadius: '6px',
                  color: 'var(--danger)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Hapus CSS
              </button>
            )}
          </div>

          <textarea
            value={theme.custom_css || ''}
            onChange={(e) => setTheme(prev => ({ ...prev, custom_css: e.target.value }))}
            placeholder={`/* Contoh: */\n.pohon-button:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);\n}`}
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: '#4ade80',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Custom HTML */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Custom HTML</h3>
            <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '4px' }}>Embed / Widget</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            Pilih template atau masukkan kode HTML/widget bebas (banner, pemutar musik, status):
          </p>

          {/* HTML Templates */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {HTML_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => setTheme(prev => ({ ...prev, custom_html: tmpl.html }))}
                style={{
                  padding: '5px 10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--accent)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                + Template {tmpl.name}
              </button>
            ))}
            {theme.custom_html && (
              <button
                type="button"
                onClick={() => setTheme(prev => ({ ...prev, custom_html: '' }))}
                style={{
                  padding: '5px 10px',
                  background: 'transparent',
                  border: '1px solid rgba(255,77,77,0.3)',
                  borderRadius: '6px',
                  color: 'var(--danger)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Hapus HTML
              </button>
            )}
          </div>

          <textarea
            value={theme.custom_html || ''}
            onChange={(e) => setTheme(prev => ({ ...prev, custom_html: e.target.value }))}
            placeholder={'<!-- Ketik kode HTML kustom kamu di sini -->\n<div style="background: rgba(74,222,128,0.1); padding: 12px; border-radius: 8px; text-align: center;">\n  Halo Dunia!\n</div>'}
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: '#60a5fa',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: '12px 24px',
            background: saved ? 'var(--success)' : 'var(--accent)',
            color: '#000', borderRadius: '8px', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >{isPending ? 'Menyimpan...' : saved ? '✓ Tersimpan!' : 'Simpan Tampilan'}</button>
      </div>

      {/* Live Preview (Desktop Only) */}
      <div className="responsive-preview-pane" style={{ width: '320px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Preview</p>
          <button
            type="button"
            onClick={refreshPreview}
            title="Refresh preview"
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}
          >
            🔄 Refresh
          </button>
        </div>
        <div style={{
          width: '100%',
          maxWidth: '320px',
          height: '600px',
          background: '#0d0d0d',
          borderRadius: '40px',
          border: '3px solid rgba(255,255,255,0.14)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 0 4px rgba(255,255,255,0.08)',
          padding: '10px 8px 12px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Dynamic Island */}
          <div style={{
            width: '80px',
            height: '16px',
            background: '#000000',
            borderRadius: '9999px',
            margin: '0 auto 8px',
            flexShrink: 0,
          }} />
          {/* Screen Content */}
          <div style={{
            flex: 1,
            borderRadius: '26px',
            overflow: 'hidden',
            background: 'var(--bg)',
          }}>
            <iframe
              ref={iframeRef}
              src={`/@${username}?preview=true`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Live preview"
              onLoad={(e) => {
                try {
                  const iframe = e.currentTarget as HTMLIFrameElement;
                  if (iframe.contentDocument) {
                    iframe.contentDocument.querySelectorAll('a, button').forEach(el => {
                      el.addEventListener('click', (ev) => ev.preventDefault());
                    });
                  }
                } catch {}
              }}
            />
          </div>
        </div>
      </div>

      {cropBgSrc && (
        <ImageCropperModal
          imageSrc={cropBgSrc}
          aspectRatio={16 / 9}
          circularCrop={false}
          title="Crop Gambar Latar (Background)"
          onCrop={handlePerformCroppedBg}
          onCancel={() => setCropBgSrc(null)}
        />
      )}

      {/* Remove Background Image Confirmation */}
      <ConfirmDialog
        isOpen={showRemoveBgConfirm}
        title="Hapus Gambar Latar?"
        message="Gambar latar kustom kamu akan dihapus dan tampilan latar akan dikembalikan ke warna solid. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Gambar"
        cancelLabel="Batal"
        isDanger={true}
        isLoading={isPending}
        onConfirm={handleConfirmRemoveBg}
        onCancel={() => setShowRemoveBgConfirm(false)}
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
