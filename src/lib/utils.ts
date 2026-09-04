import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export {
  isDangerousUrl,
  sanitizeUrl,
  formatSafeUrl,
  sanitizeSocialLinks,
  validateImageUpload,
} from './security';

/**
 * Sanitasi HTML embed/widget: buang script tags, inline event handlers, dan javascript: protocols
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/href\s*=\s*(['"])javascript:.*?\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])javascript:.*?\1/gi, 'src=""');
}

/**
 * Format media URL (Spotify, YouTube, Apple Music, SoundCloud, Vimeo, Twitch) menjadi direct embed iframe URL
 */
export function getMediaEmbedUrl(rawUrl: string): { type: 'spotify' | 'youtube' | 'apple_music' | 'soundcloud' | 'vimeo' | 'twitch' | 'calendly' | 'cal_com' | 'other'; embedUrl: string } | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();

  // 1. Spotify
  if (url.includes('open.spotify.com')) {
    if (url.includes('/embed/')) return { type: 'spotify', embedUrl: url };
    const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    return { type: 'spotify', embedUrl };
  }

  // 2. YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      return { type: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
    }
  }

  // 3. Apple Music
  if (url.includes('music.apple.com')) {
    if (url.includes('embed.music.apple.com')) return { type: 'apple_music', embedUrl: url };
    const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');
    return { type: 'apple_music', embedUrl };
  }

  // 4. SoundCloud
  if (url.includes('soundcloud.com')) {
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%237df9b6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    return { type: 'soundcloud', embedUrl };
  }

  // 5. Vimeo
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    const vimeoId = match ? match[3] : '';
    if (vimeoId) {
      return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoId}` };
    }
  }

  // 6. Twitch
  if (url.includes('twitch.tv')) {
    const channelName = url.split('twitch.tv/')[1]?.split('/')[0]?.split('?')[0] || '';
    if (channelName && !['directory', 'videos', 'p'].includes(channelName.toLowerCase())) {
      return { type: 'twitch', embedUrl: `https://player.twitch.tv/?channel=${channelName}&parent=localhost&parent=phn.my.id&parent=pohonlink.id&autoplay=false` };
    }
  }

  // 7. Calendly
  if (url.includes('calendly.com/')) {
    return { type: 'calendly', embedUrl: url };
  }

  // 8. Cal.com
  if (url.includes('cal.com/')) {
    return { type: 'cal_com', embedUrl: url };
  }

  return null;
}
