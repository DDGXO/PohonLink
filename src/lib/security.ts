/**
 * Security utilities for URL sanitization, input validation, and upload checks.
 * Pure TypeScript/JavaScript - safe for both client and server bundles.
 */

// Dangerous URI schemes that can execute code or trigger client-side vulnerabilities
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Checks if a URL string contains dangerous protocols (javascript:, data:, vbscript:, etc.).
 * Normalizes string by removing whitespace, control characters, and null bytes.
 */
export function isDangerousUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Strip control characters (\x00-\x1f, \x7f) and all whitespace
  const normalized = url.replace(/[\x00-\x1f\x7f\s]/g, '').toLowerCase();

  return DANGEROUS_PROTOCOLS.some((proto) => normalized.startsWith(proto));
}

/**
 * Sanitizes a URL, returning a safe fallback '#' if dangerous.
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = '#'): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed || isDangerousUrl(trimmed)) {
    return fallback;
  }
  return trimmed;
}

/**
 * Formats and validates a URL for web/social navigation.
 * - Rejects dangerous protocols
 * - Preserves mailto: and tel:
 * - Automatically prepends https:// if scheme is missing
 */
export function formatSafeUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || isDangerousUrl(trimmed)) {
    return '';
  }

  // Preserve mailto: and tel:
  if (/^(mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }

  // Prepend https:// if no scheme is provided
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Sanitizes a dictionary of social links, removing any dangerous protocols
 * and ensuring proper https:// schemes.
 */
export function sanitizeSocialLinks(
  socialLinks: Record<string, string> | null | undefined
): Record<string, string> {
  if (!socialLinks || typeof socialLinks !== 'object') return {};

  const clean: Record<string, string> = {};
  for (const [key, val] of Object.entries(socialLinks)) {
    if (typeof val === 'string' && val.trim()) {
      const safe = formatSafeUrl(val);
      if (safe) {
        clean[key] = safe;
      }
    }
  }
  return clean;
}

/**
 * Validates image upload file extension, MIME type, and size.
 */
export function validateImageUpload(
  file: File,
  maxSizeBytes: number = 2 * 1024 * 1024
): { valid: boolean; error?: string; ext?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: 'Pilih file gambar' };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = maxSizeBytes / (1024 * 1024);
    return { valid: false, error: `Ukuran file maksimal ${maxMb}MB` };
  }

  const parts = file.name.split('.');
  if (parts.length < 2) {
    return {
      valid: false,
      error: 'File harus memiliki ekstensi gambar yang valid (jpg, jpeg, png, webp, gif)',
    };
  }

  const ext = parts.pop()?.toLowerCase() || '';
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Hanya file JPG, JPEG, PNG, WEBP, dan GIF yang diizinkan.',
    };
  }

  // Validate MIME type if available
  if (file.type && !ALLOWED_IMAGE_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Tipe konten file tidak didukung. Hanya gambar yang diizinkan.',
    };
  }

  return { valid: true, ext };
}
