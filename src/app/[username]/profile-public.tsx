'use client';

import { useEffect, useState } from 'react';
import type { Profile, Link } from '@/types/database';
import { sanitizeHtml, sanitizeUrl, getMediaEmbedUrl } from '@/lib/utils';
import SocialIcon from '@/components/social-icons';
import AnimatedBackground from '@/components/animated-background';

interface Props {
  profile: Profile;
  links: Link[];
}

const getDomain = (urlStr: string) => {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return '';
  }
};

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length === 6) {
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }
  return `rgba(255, 255, 255, ${alpha})`;
}

export default function ProfilePublic({ profile, links }: Props) {
  const theme = profile.theme_config;
  const [copied, setCopied] = useState(false);
  const [unlockedLinks, setUnlockedLinks] = useState<Record<string, boolean>>({});
  const [activeLockModal, setActiveLockModal] = useState<{ link: Link; href: string } | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    // Check if inside iframe or preview query param to prevent inflating analytics
    const isIframe = typeof window !== 'undefined' && (window.self !== window.top || window.location.search.includes('preview=true'));
    if (isIframe) return;

    // Track pageview via Beacon
    navigator.sendBeacon('/api/track-view', JSON.stringify({ profileId: profile.id }));
  }, [profile.id]);

  const executeLinkOpen = (link: Link, href: string) => {
    if (link.type === 'link') {
      navigator.sendBeacon('/api/track-click', JSON.stringify({ linkId: link.id, profileId: profile.id }));
      if (profile.settings?.open_links_new_tab) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    window.location.assign(href);
  };

  const handleLinkClick = (link: Link, href: string) => {
    const meta = link.custom_css as Record<string, unknown> | null;
    if (meta?.is_locked && !unlockedLinks[link.id]) {
      setActiveLockModal({ link, href });
      setPinInput('');
      setLockError(null);
      return;
    }
    executeLinkOpen(link, href);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLockModal) return;
    const meta = activeLockModal.link.custom_css as Record<string, unknown> | null;
    const lockType = meta?.lock_type || 'pin';
    const correctPin = meta?.lock_pin as string | undefined;

    if (lockType === 'pin') {
      if (pinInput.trim() !== (correctPin || '')) {
        setLockError('PIN / Sandi salah!');
        return;
      }
    }

    // Mark as unlocked
    setUnlockedLinks(prev => ({ ...prev, [activeLockModal.link.id]: true }));
    const targetHref = activeLockModal.href;
    const targetLink = activeLockModal.link;
    setActiveLockModal(null);
    executeLinkOpen(targetLink, targetHref);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = profile.display_name || `@${profile.username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isVerified = profile.role === 'admin' || profile.role === 'vip' || profile.settings?.show_verified_badge;
  const showShare = profile.settings?.show_share_button ?? true;
  const isSocialBottom = profile.settings?.social_position === 'bottom';
  const layoutType = theme.layout_type || 'list';

  const getBackgroundStyle = () => {
    if (theme.bg_type === 'image' && profile.bg_url) {
      return `url(${profile.bg_url}) center/cover no-repeat fixed`;
    }
    if (theme.bg_type === 'gradient') {
      const c1 = theme.gradient_color1 || '#ff512f';
      const c2 = theme.gradient_color2 || '#dd2476';
      const dir = theme.gradient_direction || 'to_bottom';
      if (dir === 'to_top') return `linear-gradient(to top, ${c1}, ${c2})`;
      if (dir === 'to_diagonal') return `linear-gradient(135deg, ${c1}, ${c2})`;
      if (dir === 'radial') return `radial-gradient(circle at center, ${c1}, ${c2})`;
      return `linear-gradient(to bottom, ${c1}, ${c2})`;
    }
    return theme.bg_value || '#0a0a0a';
  };

  const getButtonStyles = () => {
    const style = theme.btn_style || 'solid';
    const radius = theme.btn_radius || '8px';
    const shadowColor = theme.btn_shadow_color || '#3b82f6';

    if (style === 'outline') {
      return {
        background: 'transparent',
        border: `2px solid ${theme.text_color}`,
        borderRadius: radius,
        boxShadow: 'none',
      };
    }
    if (style === 'glass') {
      const opacity = (theme.btn_glass_opacity !== undefined ? theme.btn_glass_opacity : 15) / 100;
      const blurPx = theme.btn_glass_blur !== undefined ? theme.btn_glass_blur : 16;
      const glassBg = hexToRgba(theme.card_bg || '#ffffff', opacity);
      const borderAlpha = Math.min(0.5, Math.max(0.15, opacity + 0.12));
      const borderRgba = hexToRgba(theme.text_color || '#ffffff', borderAlpha);

      return {
        background: glassBg,
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        border: `1px solid ${borderRgba}`,
        borderRadius: radius,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      };
    }
    if (style === 'hard_shadow') {
      return {
        background: theme.card_bg,
        border: `2px solid ${shadowColor}`,
        borderRadius: radius,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      };
    }
    if (style === 'soft_shadow') {
      return {
        background: theme.card_bg,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: radius,
        boxShadow: `0 10px 25px -4px ${shadowColor}`,
      };
    }
    return {
      background: theme.card_bg,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: radius,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    };
  };

  const renderSocialBar = () => {
    if (!profile.settings?.social_links || !Object.values(profile.settings.social_links).some(Boolean)) return null;
    return (
      <div className="pohon-social-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', margin: '14px 0 10px' }}>
        {Object.entries(profile.settings.social_links).map(([platform, url]) => {
          if (!url) return null;
          return (
            <a
              key={platform}
              href={sanitizeUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.text_color,
                opacity: 0.8,
                textDecoration: 'none',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
                padding: '4px',
              }}
              title={platform}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.15)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
            >
              <SocialIcon platform={platform} size={22} color="currentColor" />
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: getBackgroundStyle(),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 16px 20px',
      color: theme.text_color,
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Background Video */}
      {theme.bg_type === 'video' && theme.video_url && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.7,
          }}
          src={theme.video_url}
        />
      )}

      {/* Animated Canvas Background (Matrix, ASCII Aquarium, Starfield, Particles, Synthwave, Aura) */}
      {theme.bg_type === 'animated' && theme.animated_bg && (
        <AnimatedBackground type={theme.animated_bg} />
      )}

      {/* Custom CSS Injection */}
      {theme.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: theme.custom_css }} />
      )}

      <div style={{ width: '100%', maxWidth: layoutType === 'grid' ? '560px' : '480px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {(() => {
            const avatarShape = profile.settings?.avatar_shape || 'circle';
            const avatarRadius = avatarShape === 'circle' ? '50%' : avatarShape === 'rounded' ? '18px' : '4px';
            const avatarBorder = avatarShape === 'square' ? 'none' : '3px solid rgba(255,255,255,0.2)';
            const avatarShadow = avatarShape === 'square' ? 'none' : '0 4px 16px rgba(0,0,0,0.3)';

            return profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="pohon-avatar"
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: avatarRadius,
                  objectFit: avatarShape === 'square' ? 'contain' : 'cover',
                  margin: '0 auto 14px',
                  border: avatarBorder,
                  boxShadow: avatarShadow,
                  display: 'block',
                  background: 'transparent',
                }}
              />
            ) : (
              <div className="pohon-avatar" style={{
                width: '92px',
                height: '92px',
                borderRadius: avatarRadius,
                background: avatarShape === 'square' ? 'transparent' : 'rgba(255,255,255,0.15)',
                margin: '0 auto 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                border: avatarBorder,
              }}>🌿</div>
            );
          })()}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <h1 className="pohon-name" style={{ fontSize: '22px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {profile.display_name || profile.username}
            </h1>
            {isVerified && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: '22px' }} title="Akun Terverifikasi">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                  <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>

          {profile.settings?.hide_username === false && (
            <p className="pohon-username" style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>
              @{profile.username}
            </p>
          )}

          {profile.bio && (
            <p className="pohon-bio" style={{
              fontSize: '14px',
              opacity: 0.8,
              lineHeight: 1.6,
              maxWidth: '380px',
              margin: '10px auto 0',
              whiteSpace: 'pre-line',
            }}>
              {profile.bio}
            </p>
          )}

          {/* Social Icons Bar (Top position) */}
          {!isSocialBottom && renderSocialBar()}
        </div>

        {/* Global Custom HTML Embed */}
        {theme.custom_html && (
          <div
            className="pohon-global-html"
            style={{ width: '100%', marginBottom: '16px', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(theme.custom_html) }}
          />
        )}

        {/* Links Container (List / Grid / Carousel Layouts) */}
        <div
          className={`pohon-links layout-${layoutType}`}
          style={{
            ...(layoutType === 'grid'
              ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }
              : layoutType === 'carousel'
              ? { display: 'flex', gap: '14px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '14px', width: '100%', WebkitOverflowScrolling: 'touch' }
              : { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }),
          }}
        >
          {links.map((link) => {
                const meta = link.custom_css as Record<string, unknown> | null;
                const embedInfo = link.url ? getMediaEmbedUrl(link.url) : null;
                const isEmbed = meta?.embed_type || embedInfo?.type;

                // 1. Heading
                if (link.type === 'heading') return (
                  <div key={link.id} className="pohon-heading" style={{ textAlign: 'center', padding: '12px 0 4px', gridColumn: layoutType === 'grid' ? '1 / -1' : undefined, width: layoutType === 'carousel' ? '100%' : undefined }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.65, color: theme.text_color }}>
                      {link.title}
                    </p>
                  </div>
                );

                // 2. Spacer
                if (link.type === 'spacer') return (
                  <div key={link.id} className="pohon-spacer" style={{ height: `${link.url || '20'}px`, gridColumn: layoutType === 'grid' ? '1 / -1' : undefined }} />
                );

                // 3. Text Block
                if (link.type === 'text' && !meta?.is_html) return (
                  <div key={link.id} className="pohon-text" style={{ padding: '8px 12px', color: theme.text_color, fontSize: '14px', opacity: 0.85, lineHeight: 1.6, textAlign: 'center', whiteSpace: 'pre-line', gridColumn: layoutType === 'grid' ? '1 / -1' : undefined }}>
                    {link.url}
                  </div>
                );

                // 4. HTML Block
                if (link.type === 'html' || meta?.is_html) return (
                  <div
                    key={link.id}
                    className="pohon-html-block"
                    style={{ width: '100%', overflow: 'hidden', gridColumn: layoutType === 'grid' ? '1 / -1' : undefined }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(link.url) }}
                  />
                );

                // 5. Media Embed: Spotify
                if (isEmbed === 'spotify' && embedInfo?.embedUrl) {
                  return (
                    <div key={link.id} style={{ width: '100%', gridColumn: layoutType === 'grid' ? '1 / -1' : undefined, borderRadius: theme.btn_radius, overflow: 'hidden' }}>
                      <iframe
                        src={embedInfo.embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ border: 'none', borderRadius: theme.btn_radius }}
                      />
                    </div>
                  );
                }

                // 6. Media Embed: YouTube
                if (isEmbed === 'youtube' && embedInfo?.embedUrl) {
                  return (
                    <div key={link.id} style={{ width: '100%', gridColumn: layoutType === 'grid' ? '1 / -1' : undefined, borderRadius: theme.btn_radius, overflow: 'hidden' }}>
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: theme.btn_radius }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          src={embedInfo.embedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                }

                // 7. Media Embed: Apple Music
                if (isEmbed === 'apple_music' && embedInfo?.embedUrl) {
                  return (
                    <div key={link.id} style={{ width: '100%', gridColumn: layoutType === 'grid' ? '1 / -1' : undefined, borderRadius: theme.btn_radius, overflow: 'hidden' }}>
                      <iframe
                        src={embedInfo.embedUrl}
                        width="100%"
                        height="175"
                        frameBorder="0"
                        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                        style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', borderRadius: theme.btn_radius, border: 'none' }}
                      />
                    </div>
                  );
                }

                // 8. Standard Links / Contact Buttons
                const rawHref = link.type === 'email'
                  ? (link.url?.startsWith('mailto:') ? link.url : `mailto:${link.url}`)
                  : link.type === 'telephone'
                  ? (link.url?.startsWith('tel:') ? link.url : `tel:${link.url}`)
                  : link.url || '#';
                const href = sanitizeUrl(rawHref);
                const domain = link.type === 'link' && link.url ? getDomain(link.url) : '';
                const btnStyleProps = getButtonStyles();
                const isLocked = meta?.is_locked && !unlockedLinks[link.id];

                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link, href)}
                    className="pohon-button"
                    style={{
                      width: layoutType === 'carousel' ? '240px' : '100%',
                      minWidth: layoutType === 'carousel' ? '240px' : undefined,
                      flexShrink: layoutType === 'carousel' ? 0 : undefined,
                      scrollSnapAlign: layoutType === 'carousel' ? 'center' : undefined,
                      minHeight: layoutType === 'grid' ? '72px' : '54px',
                      padding: layoutType === 'grid' ? '12px 14px' : '12px 44px',
                      ...btnStyleProps,
                      color: theme.text_color,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      touchAction: 'manipulation',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                  >
                    {domain && !isLocked && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                        alt=""
                        style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                        }}
                        onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                    )}
                    {link.type === 'email' && <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>📧</span>}
                    {Boolean(isLocked) && <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>}

                    <span style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                      {link.title}
                    </span>

                    {meta?.subtitle ? (
                      <span style={{ fontSize: '11px', opacity: 0.75, fontWeight: 400, marginTop: '2px', lineHeight: 1.2 }}>
                        {String(meta.subtitle)}
                      </span>
                    ) : null}

                    {Boolean(isLocked) && (
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.18)', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', fontWeight: 500 }}>
                        {meta?.lock_type === 'age' ? '18+ Terkunci' : meta?.lock_type === 'sensitive' ? 'Peringatan Konten' : 'Kunci PIN'}
                      </span>
                    )}
                  </button>
                );
          })}

          {links.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px', opacity: 0.5, gridColumn: layoutType === 'grid' ? '1 / -1' : undefined }}>
              <p style={{ fontSize: '14px' }}>Belum ada link yang aktif saat ini</p>
            </div>
          )}
        </div>

        {/* Social Icons Bar (Bottom position) */}
        {isSocialBottom && renderSocialBar()}
      </div>

      {/* Footer */}
      {profile.settings?.show_footer !== false && (
        <footer className="pohon-footer" style={{
          textAlign: 'center',
          padding: '40px 16px 16px',
          opacity: 0.45,
          fontSize: '12px',
          width: '100%',
          marginTop: 'auto',
        }}>
          {profile.settings?.custom_footer_text?.trim() ? (
            <span>{profile.settings.custom_footer_text.trim()}</span>
          ) : (
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
              🌿 Dibuat dengan Pohonlink
            </a>
          )}
        </footer>
      )}

      {/* Floating Share Button */}
      {showShare && (
        <button
          onClick={handleShare}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--surface, #1e1e1e)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            zIndex: 50,
            transition: 'transform 0.15s',
          }}
          title="Bagikan profil"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      )}

      {/* Toast Notification */}
      {copied && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          background: '#22c55e',
          color: '#000000',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 60,
        }}>
          ✓ Link profil disalin!
        </div>
      )}

      {/* Lock / Gated Link Modal */}
      {activeLockModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--surface, #1e1e1e)',
            border: '1px solid var(--border, rgba(255,255,255,0.15))',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '360px',
            width: '100%',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>
              {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'age' ? '🔞' : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'sensitive' ? '⚠️' : '🔒'}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              {activeLockModal.link.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
              {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'age'
                ? 'Link ini diperuntukkan untuk pengguna berusia 18 tahun ke atas. Konfirmasi umur kamu untuk membuka.'
                : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'sensitive'
                ? 'Link ini mungkin mengandung konten sensitif. Apakah kamu ingin tetap melanjutkan?'
                : 'Link ini dilindungi PIN. Masukkan PIN untuk membuka tautan.'}
            </p>

            {lockError && (
              <div style={{ padding: '8px 12px', background: 'rgba(255,77,77,0.15)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: '#ff6b6b', fontSize: '12px', marginBottom: '12px' }}>
                {lockError}
              </div>
            )}

            <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'pin' && (
                <input
                  type="password"
                  placeholder="Masukkan PIN / Sandi"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '3px',
                    boxSizing: 'border-box',
                  }}
                />
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--accent, #4ade80)',
                    color: '#000',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'age' ? 'Saya 18+ Tahun' : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'sensitive' ? 'Saya Mengerti' : 'Buka Kunci'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLockModal(null)}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#aaa',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
