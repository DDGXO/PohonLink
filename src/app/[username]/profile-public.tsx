'use client';

import { useEffect, useState } from 'react';
import type { Profile, Link } from '@/types/database';
import { sanitizeHtml, sanitizeUrl } from '@/lib/utils';

interface Props {
  profile: Profile;
  links: Link[];
}

const getPlatformDomain = (platform: string) => {
  switch (platform) {
    case 'instagram': return 'instagram.com';
    case 'tiktok': return 'tiktok.com';
    case 'youtube': return 'youtube.com';
    case 'twitter': return 'twitter.com';
    case 'github': return 'github.com';
    case 'discord': return 'discord.com';
    case 'whatsapp': return 'whatsapp.com';
    case 'telegram': return 'telegram.org';
    default: return `${platform}.com`;
  }
};

const getDomain = (urlStr: string) => {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return '';
  }
};

export default function ProfilePublic({ profile, links }: Props) {
  const theme = profile.theme_config;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Track pageview via Beacon
    navigator.sendBeacon('/api/track-view', JSON.stringify({ profileId: profile.id }));
  }, [profile.id]);

  const handleLinkClick = (link: Link, href: string) => {
    if (link.type === 'link') {
      navigator.sendBeacon('/api/track-click', JSON.stringify({ linkId: link.id, profileId: profile.id }));
      if (profile.settings?.open_links_new_tab) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    window.location.assign(href);
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

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg_type === 'image' && profile.bg_url ? `url(${profile.bg_url}) center/cover no-repeat fixed` : theme.bg_value,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 16px 20px',
      color: theme.text_color,
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Custom CSS Injection */}
      {theme.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: theme.custom_css }} />
      )}

      <div style={{ width: '100%', maxWidth: '480px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="pohon-avatar"
              style={{
                width: '92px', height: '92px', borderRadius: '50%',
                objectFit: 'cover', margin: '0 auto 14px',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                display: 'block',
              }}
            />
          ) : (
            <div className="pohon-avatar" style={{
              width: '92px', height: '92px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px',
              border: '2px solid rgba(255,255,255,0.1)',
            }}>🌿</div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <h1 className="pohon-name" style={{ fontSize: '22px', fontWeight: 700 }}>
              {profile.display_name || profile.username}
            </h1>
            {isVerified && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          {profile.settings?.hide_username === false && (
            <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>@{profile.username}</p>
          )}

          {profile.bio && (
            <p className="pohon-bio" style={{ fontSize: '14px', opacity: 0.85, lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 16px', whiteSpace: 'pre-line' }}>
              {profile.bio}
            </p>
          )}

          {/* Social Icons Bar */}
          {profile.settings?.social_links && Object.values(profile.settings.social_links).some(Boolean) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '8px' }}>
              {Object.entries(profile.settings.social_links).map(([platform, url]) => {
                if (!url) return null;
                return (
                  <a
                    key={platform}
                    href={sanitizeUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.text_color,
                      textDecoration: 'none',
                      transition: 'transform 0.15s, background 0.15s',
                    }}
                    title={platform}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${getPlatformDomain(platform)}&sz=64`}
                      alt={platform}
                      style={{ width: '18px', height: '18px', borderRadius: '4px' }}
                      onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Custom HTML Embed */}
        {theme.custom_html && (
          <div
            className="pohon-global-html"
            style={{ width: '100%', marginBottom: '16px', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(theme.custom_html) }}
          />
        )}

        {/* Links */}
        <div className="pohon-links" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {links.map((link) => {
            // Heading
            if (link.type === 'heading') return (
              <div key={link.id} className="pohon-heading" style={{ textAlign: 'center', padding: '12px 0 4px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.65, color: theme.text_color }}>
                  {link.title}
                </p>
              </div>
            );
            // Spacer
            if (link.type === 'spacer') return (
              <div key={link.id} className="pohon-spacer" style={{ height: `${link.url || '20'}px` }} />
            );
            // Text
            if (link.type === 'text') return (
              <div key={link.id} className="pohon-text" style={{ padding: '8px 12px', color: theme.text_color, fontSize: '14px', opacity: 0.85, lineHeight: 1.6, textAlign: 'center', whiteSpace: 'pre-line' }}>
                {link.url}
              </div>
            );
            // HTML / Embed Block
            if (link.type === 'html' && link.url) return (
              <div
                key={link.id}
                className="pohon-html-block"
                style={{ width: '100%', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(link.url) }}
              />
            );
            // Link / email / telephone — render as button
            const rawHref = link.type === 'email'
              ? (link.url?.startsWith('mailto:') ? link.url : `mailto:${link.url}`)
              : link.type === 'telephone'
              ? (link.url?.startsWith('tel:') ? link.url : `tel:${link.url}`)
              : link.url || '#';
            const href = sanitizeUrl(rawHref);

            const domain = link.type === 'link' && link.url ? getDomain(link.url) : '';

            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link, href)}
                className="pohon-button"
                style={{
                  width: '100%', minHeight: '52px', padding: '14px 44px',
                  background: theme.btn_style === 'outline' ? 'transparent' : theme.card_bg,
                  border: theme.btn_style === 'outline' ? `2px solid ${theme.text_color}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: theme.btn_radius, color: theme.text_color,
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer', textAlign: 'center',
                  transition: 'opacity 0.15s, transform 0.1s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  touchAction: 'manipulation',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
              >
                {domain && (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                    alt=""
                    style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      position: 'absolute', left: '16px',
                    }}
                    onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                  />
                )}
                {link.type === 'email' && <span style={{ position: 'absolute', left: '16px' }}>📧</span>}
                {link.type === 'telephone' && <span style={{ position: 'absolute', left: '16px' }}>📞</span>}
                <span>{link.title}</span>
              </button>
            );
          })}
        </div>

        {links.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px', opacity: 0.5 }}>
            <p style={{ fontSize: '14px' }}>Belum ada link yang aktif</p>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="pohon-footer" style={{
        textAlign: 'center',
        padding: '40px 16px 16px',
        opacity: 0.45,
        fontSize: '12px',
        width: '100%',
        marginTop: 'auto',
      }}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
          🌿 Dibuat dengan Pohonlink
        </a>
      </footer>

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
    </div>
  );
}
