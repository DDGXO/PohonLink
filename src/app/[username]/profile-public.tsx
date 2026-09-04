'use client';

import { useEffect, useState, useTransition } from 'react';
import type { Profile, Link } from '@/types/database';
import { sanitizeHtml, sanitizeUrl, getMediaEmbedUrl } from '@/lib/utils';
import { submitLeadCapture } from '@/app/actions';
import SocialIcon from '@/components/social-icons';
import AnimatedBackground from '@/components/animated-background';

interface Props {
  profile: Profile;
  links: Link[];
  products?: Link[];
  initialTab?: 'links' | 'shop';
}

const getDomain = (urlStr: string) => {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return '';
  }
};

const formatCurrency = (val: string | number | undefined) => {
  if (!val) return 'Rp 0';
  const num = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
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

export default function ProfilePublic({ profile, links, products = [], initialTab = 'links' }: Props) {
  const theme = profile.theme_config;
  const isShopEnabled = profile.settings?.enable_shop !== false;
  const hasShop = isShopEnabled && products.length > 0;
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>(initialTab === 'shop' && isShopEnabled ? 'shop' : 'links');
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
    navigator.sendBeacon(
      '/api/track-view',
      JSON.stringify({
        profileId: profile.id,
        referer: typeof document !== 'undefined' ? document.referrer : '',
        search: typeof window !== 'undefined' ? window.location.search : '',
      })
    );

    // Multi-Pixel Tracking Injection
    const pixels = profile.settings?.marketing_pixels;
    if (pixels) {
      if (pixels.ga4_id && !document.getElementById('ga4-script')) {
        const s = document.createElement('script');
        s.id = 'ga4-script';
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.ga4_id}`;
        document.head.appendChild(s);
        const inline = document.createElement('script');
        inline.id = 'ga4-init';
        inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${pixels.ga4_id}');`;
        document.head.appendChild(inline);
      }
      if (pixels.meta_pixel_id && !document.getElementById('meta-pixel-script')) {
        const metaScript = document.createElement('script');
        metaScript.id = 'meta-pixel-script';
        metaScript.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${pixels.meta_pixel_id}');fbq('track', 'PageView');`;
        document.head.appendChild(metaScript);
      }
      if (pixels.tiktok_pixel_id && !document.getElementById('tiktok-pixel-script')) {
        const ttScript = document.createElement('script');
        ttScript.id = 'tiktok-pixel-script';
        ttScript.innerHTML = `!function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)}; ttq.load('${pixels.tiktok_pixel_id}'); ttq.page(); }(window, document, 'ttq');`;
        document.head.appendChild(ttScript);
      }
    }
  }, [profile.id, profile.settings?.marketing_pixels]);

  const executeLinkOpen = (link: Link, href: string) => {
    if (link.type === 'link') {
      navigator.sendBeacon(
        '/api/track-click',
        JSON.stringify({
          linkId: link.id,
          profileId: profile.id,
          referer: typeof document !== 'undefined' ? document.referrer : '',
          search: typeof window !== 'undefined' ? window.location.search : '',
        })
      );
      
      // Auto Forward UTM params if outbound
      let finalHref = href;
      if (typeof window !== 'undefined' && window.location.search && href.startsWith('http')) {
        try {
          const currentParams = new URLSearchParams(window.location.search);
          const targetUrl = new URL(href);
          currentParams.forEach((val, key) => {
            if (key.startsWith('utm_') && !targetUrl.searchParams.has(key)) {
              targetUrl.searchParams.set(key, val);
            }
          });
          finalHref = targetUrl.toString();
        } catch {}
      }

      if (profile.settings?.open_links_new_tab) {
        window.open(finalHref, '_blank', 'noopener,noreferrer');
        return;
      }
      window.location.assign(finalHref);
    } else {
      window.location.assign(href);
    }
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

  const handleProductClick = (product: Link) => {
    if (!product.url) return;
    navigator.sendBeacon(
      '/api/track-click',
      JSON.stringify({
        linkId: product.id,
        profileId: profile.id,
        referer: typeof document !== 'undefined' ? document.referrer : '',
        search: typeof window !== 'undefined' ? window.location.search : '',
      })
    );
    if (profile.settings?.open_links_new_tab) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
      return;
    }
    window.location.assign(product.url);
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
    } else if (lockType === 'subscribe') {
      const email = pinInput.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setLockError('Alamat email tidak valid!');
        return;
      }
      // Save lead capture for subscribe to unlock
      submitLeadCapture(profile.id, 'Subscriber', email, `Unlock: ${activeLockModal.link.title || 'Link'}`);
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
            const shape = profile.settings?.avatar_shape || 'circle';
            const fit = profile.settings?.avatar_fit || 'cover';
            const zoom = profile.settings?.avatar_zoom ?? 100;
            const size = profile.settings?.avatar_size || 'medium';
            const borderStyle = profile.settings?.avatar_border_style || (shape === 'square' ? 'none' : 'solid');
            const borderWidth = profile.settings?.avatar_border_width ?? (shape === 'square' ? 0 : 2);
            const borderColor = profile.settings?.avatar_border_color || '#4ade80';
            const shadow = profile.settings?.avatar_shadow || (shape === 'square' ? 'none' : 'soft');
            const customRadius = profile.settings?.avatar_radius_custom ?? (shape === 'circle' ? 50 : 16);

            const sizeMap = {
              small: { base: 72, wideW: 130, wideH: 72, maxW: 130, maxH: 80 },
              medium: { base: 92, wideW: 170, wideH: 92, maxW: 170, maxH: 110 },
              large: { base: 116, wideW: 220, wideH: 116, maxW: 220, maxH: 140 },
              xlarge: { base: 148, wideW: 280, wideH: 148, maxW: 280, maxH: 180 },
            }[size] || { base: 92, wideW: 170, wideH: 92, maxW: 170, maxH: 110 };

            let w: string | number = sizeMap.base;
            let h: string | number = sizeMap.base;
            let r = '50%';
            let maxW: string | undefined = undefined;
            let maxH: string | undefined = undefined;

            if (shape === 'circle') {
              r = '50%';
            } else if (shape === 'custom') {
              r = `${customRadius}%`;
            } else if (shape === 'rounded') {
              r = size === 'small' ? '12px' : size === 'xlarge' ? '24px' : '18px';
            } else if (shape === 'square') {
              r = '4px';
            } else if (shape === 'wide') {
              r = '14px';
              w = sizeMap.wideW;
              h = sizeMap.wideH;
            } else if (shape === 'original') {
              r = '12px';
              w = 'auto';
              h = 'auto';
              maxW = `${sizeMap.maxW}px`;
              maxH = `${sizeMap.maxH}px`;
            }

            const effBorderWidth = borderStyle === 'none' ? 0 : borderWidth;
            const effBorderColor = borderColor || '#4ade80';

            let border = 'none';
            if (borderStyle !== 'none' && effBorderWidth > 0) {
              if (borderStyle === 'glow') {
                border = `${effBorderWidth}px solid ${effBorderColor}`;
              } else {
                border = `${effBorderWidth}px ${borderStyle} ${effBorderColor}`;
              }
            }

            let boxShadow = 'none';
            if (borderStyle === 'glow' || shadow === 'glow') {
              boxShadow = `0 0 ${12 + effBorderWidth * 3}px ${effBorderColor}, 0 4px 16px rgba(0,0,0,0.35)`;
            } else if (shadow === 'hard') {
              boxShadow = `4px 4px 0px ${effBorderColor || '#000000'}`;
            } else if (shadow === 'soft') {
              boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }

            const masking = profile.settings?.avatar_masking || (shape === 'original' ? 'full' : 'crop');
            const isFullCanvas = masking === 'full';

            const videoAvatar = profile.settings?.avatar_video_url?.trim() || (profile.avatar_url && (profile.avatar_url.endsWith('.mp4') || profile.avatar_url.endsWith('.webm')) ? profile.avatar_url : null);

            const containerStyle: React.CSSProperties = {
              width: isFullCanvas ? 'auto' : w,
              height: isFullCanvas ? 'auto' : h,
              maxWidth: maxW,
              maxHeight: maxH,
              borderRadius: r,
              border: isFullCanvas && !videoAvatar && !profile.avatar_url ? border : (isFullCanvas ? 'none' : border),
              boxShadow: isFullCanvas ? 'none' : boxShadow,
              margin: '0 auto 14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: isFullCanvas ? 'visible' : 'hidden',
              position: 'relative',
              background: shape === 'square' || shape === 'original' || isFullCanvas ? 'transparent' : 'rgba(255,255,255,0.15)',
            };

            const offsetX = profile.settings?.avatar_offset_x ?? 0;
            const offsetY = profile.settings?.avatar_offset_y ?? 0;

            const mediaStyle: React.CSSProperties = {
              width: isFullCanvas ? 'auto' : (shape === 'original' ? 'auto' : '100%'),
              height: isFullCanvas ? 'auto' : (shape === 'original' ? 'auto' : '100%'),
              maxWidth: isFullCanvas ? '280px' : '100%',
              maxHeight: isFullCanvas ? '200px' : '100%',
              objectFit: isFullCanvas ? 'contain' : fit,
              borderRadius: isFullCanvas ? r : undefined,
              border: isFullCanvas ? border : undefined,
              boxShadow: isFullCanvas ? boxShadow : undefined,
              objectPosition: !isFullCanvas ? `${50 + offsetX}% ${50 + offsetY}%` : undefined,
              transform: isFullCanvas
                ? `translate(${offsetX}%, ${offsetY}%) scale(${zoom / 100})`
                : `scale(${zoom / 100})`,
              transformOrigin: 'center center',
              display: 'block',
            };

            if (videoAvatar) {
              const isVideoFile = videoAvatar.endsWith('.mp4') || videoAvatar.endsWith('.webm') || videoAvatar.includes('format=mp4') || videoAvatar.includes('.mp4?') || videoAvatar.includes('.webm?');

              return (
                <div className="pohon-avatar" style={containerStyle}>
                  {isVideoFile ? (
                    <video
                      src={videoAvatar}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={mediaStyle}
                    />
                  ) : (
                    <img
                      src={videoAvatar}
                      alt={profile.display_name || profile.username}
                      style={mediaStyle}
                    />
                  )}
                </div>
              );
            }

            return profile.avatar_url ? (
              <div className="pohon-avatar" style={containerStyle}>
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  style={mediaStyle}
                />
              </div>
            ) : (
              <div className="pohon-avatar" style={containerStyle}>
                <span style={{ fontSize: size === 'small' ? '30px' : size === 'xlarge' ? '54px' : '40px' }}>🌿</span>
              </div>
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

          {/* vCard Contact Download */}
          {profile.settings?.vcard?.enabled && (
            <div style={{ marginTop: '12px' }}>
              <a
                href={`/api/vcard/${profile.username}`}
                download={`${profile.username}-contact.vcf`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: theme.btn_radius || '4px',
                  color: theme.text_color,
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.15s',
                }}
              >
                <span>📇</span>
                <span>Simpan Kontak</span>
              </a>
            </div>
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



        {/* Tab Switcher if Shop is enabled and has products */}
        {hasShop && (
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '9999px',
            padding: '4px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '340px',
            marginLeft: 'auto',
            marginRight: 'auto',
            border: '1px solid rgba(255,255,255,0.12)',
            boxSizing: 'border-box',
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'links' ? (theme.card_bg || 'rgba(255,255,255,0.25)') : 'transparent',
                color: theme.text_color,
                fontSize: '13px',
                fontWeight: activeTab === 'links' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'links' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              🔗 Tautan ({links.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shop')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'shop' ? (theme.card_bg || 'rgba(255,255,255,0.25)') : 'transparent',
                color: theme.text_color,
                fontSize: '13px',
                fontWeight: activeTab === 'shop' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'shop' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              🛍️ {profile.settings?.shop_title || 'Toko'} ({products.length})
            </button>
          </div>
        )}

        {/* Links Tab Content */}
        {activeTab === 'links' && (
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

                  if (link.type === 'heading') {
                    return (
                      <div
                        key={link.id}
                        className="pohon-heading"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: '12px 0 4px',
                          gridColumn: layoutType === 'grid' ? '1 / -1' : undefined,
                        }}
                      >
                        <h3 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9, margin: 0 }}>
                          {link.title}
                        </h3>
                      </div>
                    );
                  }

                  if (link.type === 'spacer') {
                    const heightPx = meta?.height ? Number(meta.height) : 24;
                    return (
                      <div
                        key={link.id}
                        className="pohon-spacer"
                        style={{
                          height: `${heightPx}px`,
                          width: '100%',
                          gridColumn: layoutType === 'grid' ? '1 / -1' : undefined,
                        }}
                      />
                    );
                  }

                  if (link.type === 'text') {
                    if (meta?.is_html && link.url) {
                      return (
                        <div
                          key={link.id}
                          className="pohon-custom-html"
                          style={{
                            width: '100%',
                            overflow: 'hidden',
                            gridColumn: layoutType === 'grid' ? '1 / -1' : undefined,
                          }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(link.url) }}
                        />
                      );
                    }
                    return (
                      <div
                        key={link.id}
                        className="pohon-text-block"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: '8px 16px',
                          fontSize: '13px',
                          opacity: 0.75,
                          lineHeight: 1.5,
                          gridColumn: layoutType === 'grid' ? '1 / -1' : undefined,
                        }}
                      >
                        {link.title}
                      </div>
                    );
                  }

                  if (link.type === 'lead_form') {
                    return (
                      <LeadFormWidget
                        key={link.id}
                        link={link}
                        profileId={profile.id}
                        theme={theme}
                        layoutType={layoutType}
                      />
                    );
                  }

                  if (isEmbed && link.url) {
                    const embed = embedInfo;
                    const embedType = meta?.embed_type || embed?.type;
                    const embedSrc = meta?.embed_url || embed?.embedUrl;

                    if (embedSrc) {
                      const iconMap: Record<string, string> = {
                        spotify: '🎵',
                        youtube: '▶️',
                        apple_music: '🍎',
                        soundcloud: '☁️',
                        vimeo: '🎬',
                        twitch: '🟣',
                        calendly: '📅',
                        cal_com: '📆',
                      };
                      const isCalendar = String(embedType) === 'calendly' || String(embedType) === 'cal_com';
                      const iframeHeight = isCalendar ? '560' : String(embedType) === 'spotify' ? '152' : String(embedType) === 'apple_music' ? '175' : String(embedType) === 'soundcloud' ? '166' : '220';
                      return (
                        <div
                          key={link.id}
                          className="pohon-embed-card"
                          style={{
                            width: '100%',
                            borderRadius: theme.btn_radius || '4px',
                            overflow: 'hidden',
                            background: theme.card_bg,
                            border: '1px solid rgba(255,255,255,0.1)',
                            gridColumn: layoutType === 'grid' ? '1 / -1' : undefined,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                          }}
                        >
                          {link.title && (
                            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px' }}>
                                {iconMap[String(embedType)] || '▶️'}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>{link.title}</span>
                            </div>
                          )}
                          <div style={{ position: 'relative', width: '100%', minHeight: `${iframeHeight}px` }}>
                            <iframe
                              src={String(embedSrc)}
                              width="100%"
                              height={iframeHeight}
                              style={{ border: 'none', display: 'block' }}
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              title={link.title || 'Media Embed'}
                            />
                          </div>
                        </div>
                      );
                    }
                  }

                  let href = '#';
                  if (link.type === 'email' && link.url) {
                    href = link.url.startsWith('mailto:') ? link.url : `mailto:${link.url}`;
                  } else if (link.type === 'telephone' && link.url) {
                    href = link.url.startsWith('tel:') ? link.url : `tel:${link.url}`;
                  } else if (link.url) {
                    href = sanitizeUrl(link.url);
                  }

                  const domain = link.url ? getDomain(link.url) : '';
                  const btnStyles = getButtonStyles();
                  const isLocked = meta?.is_locked && !unlockedLinks[link.id];
                  const isFeatured = Boolean(meta?.is_featured);

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link, href)}
                      className={`pohon-link-btn ${link.is_pinned ? 'is-pinned' : ''} ${isFeatured ? 'is-featured' : ''}`}
                      style={{
                        ...btnStyles,
                        width: '100%',
                        padding: layoutType === 'grid' ? '14px 12px' : isFeatured ? '18px 20px' : '15px 20px',
                        color: theme.text_color,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        boxSizing: 'border-box',
                        minHeight: layoutType === 'grid' ? '72px' : isFeatured ? '60px' : '52px',
                        border: isFeatured ? '1.5px solid var(--accent, #7DF9B6)' : btnStyles.border,
                        boxShadow: isFeatured ? '0 0 24px rgba(125, 249, 182, 0.25)' : btnStyles.boxShadow,
                        flexShrink: layoutType === 'carousel' ? 0 : undefined,
                        minWidth: layoutType === 'carousel' ? '200px' : undefined,
                        scrollSnapAlign: layoutType === 'carousel' ? 'start' : undefined,
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                    >
                      {isFeatured && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '12px',
                          background: 'var(--accent, #7DF9B6)',
                          color: '#000000',
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          letterSpacing: '0.04em',
                        }}>
                          ⭐ FEATURED
                        </span>
                      )}

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

                      <span style={{ fontSize: isFeatured ? '15px' : '14px', fontWeight: isFeatured ? 700 : 600, lineHeight: 1.3 }}>
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
        )}

        {/* Shop Tab Content (Grid or List Layout) */}
        {activeTab === 'shop' && (
          <div
            className={`pohon-shop-${profile.settings?.shop_layout || 'grid'}`}
            style={{
              ...(profile.settings?.shop_layout === 'list'
                ? { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }
                : { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }),
              boxSizing: 'border-box',
            }}
          >
            {products.map((product) => {
              const meta = (product.custom_css as Record<string, unknown> | null) || {};
              const hasOrigPrice = Boolean(meta.original_price && Number(meta.original_price) > Number(meta.price));
              const discountPct = hasOrigPrice
                ? Math.round(((Number(meta.original_price) - Number(meta.price)) / Number(meta.original_price)) * 100)
                : 0;
              const isList = profile.settings?.shop_layout === 'list';

              if (isList) {
                return (
                  <div
                    key={product.id}
                    className="pohon-product-card-list"
                    style={{
                      background: theme.btn_style === 'outline' ? 'transparent' : (theme.card_bg || 'rgba(255,255,255,0.08)'),
                      border: theme.btn_style === 'outline' ? `1.5px solid ${theme.text_color}` : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      gap: '12px',
                      color: theme.text_color,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0, borderRadius: '0px', overflow: 'hidden', background: 'rgba(0,0,0,0.25)' }}>
                      {meta.image_url ? (
                        <img
                          src={String(meta.image_url)}
                          alt={product.title || ''}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                          📦
                        </div>
                      )}
                      {meta.badge ? (
                        <span style={{
                          position: 'absolute',
                          top: '0px',
                          left: '0px',
                          background: 'rgba(0,0,0,0.9)',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: 700,
                          padding: '2px 4px',
                          borderRadius: '0px',
                        }}>
                          {String(meta.badge)}
                        </span>
                      ) : null}
                    </div>

                    {/* Details Middle */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.title}
                      </h4>
                      {meta.description ? (
                        <p style={{ fontSize: '11px', opacity: 0.7, margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {String(meta.description)}
                        </p>
                      ) : null}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent, #4ade80)' }}>
                          {formatCurrency(meta.price as string | number)}
                        </span>
                        {hasOrigPrice && (
                          <span style={{ fontSize: '10px', opacity: 0.5, textDecoration: 'line-through' }}>
                            {formatCurrency(meta.original_price as string | number)}
                          </span>
                        )}
                        {discountPct > 0 && (
                          <span style={{ fontSize: '9px', background: '#ef4444', color: '#fff', padding: '1px 4px', borderRadius: '0px', fontWeight: 700 }}>
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA Button Right */}
                    <button
                      type="button"
                      onClick={() => handleProductClick(product)}
                      style={{
                        flexShrink: 0,
                        padding: '8px 12px',
                        background: 'var(--accent, #4ade80)',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '0px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s, transform 0.1s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    >
                      {String(meta.button_text || 'Beli 🛒')}
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={product.id}
                  className="pohon-product-card"
                  style={{
                    background: theme.btn_style === 'outline' ? 'transparent' : (theme.card_bg || 'rgba(255,255,255,0.08)'),
                    border: theme.btn_style === 'outline' ? `1.5px solid ${theme.text_color}` : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    color: theme.text_color,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    position: 'relative',
                  }}
                >
                  {/* Product Image */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: 'rgba(0,0,0,0.25)', overflow: 'hidden', borderRadius: '0px' }}>
                    {meta.image_url ? (
                      <img
                        src={String(meta.image_url)}
                        alt={product.title || ''}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '0px',
                          transition: 'transform 0.3s',
                        }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                        📦
                      </div>
                    )}

                    {/* Badge */}
                    {meta.badge ? (
                      <span style={{
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        background: 'rgba(0,0,0,0.9)',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '3px 6px',
                        borderRadius: '0px',
                      }}>
                        {String(meta.badge)}
                      </span>
                    ) : null}

                    {/* Discount Pill */}
                    {discountPct > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '3px 6px',
                        borderRadius: '0px',
                      }}>
                        -{discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 3px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.title}
                      </h4>
                      {meta.description ? (
                        <p style={{ fontSize: '10px', opacity: 0.7, margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {String(meta.description)}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent, #4ade80)' }}>
                          {formatCurrency(meta.price as string | number)}
                        </span>
                        {hasOrigPrice && (
                          <span style={{ fontSize: '9px', opacity: 0.5, textDecoration: 'line-through' }}>
                            {formatCurrency(meta.original_price as string | number)}
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button
                        type="button"
                        onClick={() => handleProductClick(product)}
                        style={{
                          width: '100%',
                          padding: '8px 8px',
                          background: 'var(--accent, #4ade80)',
                          color: '#000000',
                          border: 'none',
                          borderRadius: '0px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'opacity 0.15s, transform 0.1s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      >
                        {String(meta.button_text || 'Beli Sekarang 🛒')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px', opacity: 0.5, gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '14px' }}>Belum ada produk di toko</p>
              </div>
            )}
          </div>
        )}

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
            <a href="/about" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
              Dibuat dengan Pohonlink
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
              {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'age' ? '🔞' : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'sensitive' ? '⚠️' : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'subscribe' ? '📩' : '🔒'}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              {activeLockModal.link.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
              {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'age'
                ? 'Link ini diperuntukkan untuk pengguna berusia 18 tahun ke atas. Konfirmasi umur kamu untuk membuka.'
                : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'sensitive'
                ? 'Link ini mungkin mengandung konten sensitif. Apakah kamu ingin tetap melanjutkan?'
                : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'subscribe'
                ? 'Masukkan alamat email kamu untuk membuka tautan eksklusif ini.'
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

              {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'subscribe' && (
                <input
                  type="email"
                  placeholder="Masukkan email kamu..."
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
                  {(activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'age' ? 'Saya 18+ Tahun' : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'sensitive' ? 'Saya Mengerti' : (activeLockModal.link.custom_css as Record<string, unknown> | null)?.lock_type === 'subscribe' ? 'Buka & Dapatkan Link' : 'Buka Kunci'}
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

function LeadFormWidget({ link, profileId, theme, layoutType }: { link: Link; profileId: string; theme: Profile['theme_config']; layoutType: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitLeadCapture(profileId, name, email, link.title || undefined);
      if (res?.error) setError(res.error);
      else {
        setSubmitted(true);
      }
    });
  };

  return (
    <div
      style={{
        width: '100%',
        background: theme.card_bg,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: theme.btn_radius || '4px',
        padding: '18px 20px',
        gridColumn: layoutType === 'grid' ? '1 / -1' : undefined,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '18px' }}>📩</span>
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0 2px', color: theme.text_color }}>
          {link.title || 'Daftar Newsletter'}
        </h4>
        {(link.custom_css as Record<string, unknown> | null)?.subtitle ? (
          <p style={{ fontSize: '12px', opacity: 0.7, margin: 0, lineHeight: 1.4 }}>
            {String((link.custom_css as Record<string, unknown>).subtitle)}
          </p>
        ) : null}
      </div>

      {submitted ? (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: 'rgba(125,249,182,0.15)',
          border: '1px solid var(--accent, #7DF9B6)',
          borderRadius: theme.btn_radius || '4px',
          fontSize: '13px',
          color: 'var(--accent, #7DF9B6)',
          fontWeight: 600,
        }}>
          ✓ Terima kasih! Data Anda berhasil disimpan.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {error && (
            <div style={{ padding: '6px 10px', background: 'rgba(255,77,77,0.15)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '4px', fontSize: '11px', color: '#ff6b6b' }}>
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Nama Anda"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '9px 12px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: theme.btn_radius || '4px',
              color: theme.text_color,
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="email"
            placeholder="Email Anda"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '9px 12px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: theme.btn_radius || '4px',
              color: theme.text_color,
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--accent, #7DF9B6)',
              color: '#000000',
              border: 'none',
              borderRadius: theme.btn_radius || '4px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {isPending ? 'Mengirim...' : 'Daftar Sekarang'}
          </button>
        </form>
      )}
    </div>
  );
}
