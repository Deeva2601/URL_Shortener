export const RESERVED_SLUGS = new Set([
  'analytics',
  'api',
  'how-it-works',
  'health',
  'favicon.ico',
  'robots.txt'
]);

export function normalizeSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function validateOriginalUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) {
    return { valid: false, message: 'Enter a URL under 2,048 characters.' };
  }

  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, message: 'Only http and https links can be shortened.' };
    }
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
      return { valid: false, message: 'Enter a valid website address.' };
    }
    return { valid: true, value: url.toString() };
  } catch {
    return { valid: false, message: 'Enter a valid URL, including https://.' };
  }
}

export function validateCustomSlug(value) {
  const slug = normalizeSlug(value);
  if (!slug || slug.length < 3) {
    return { valid: false, message: 'Custom aliases must be at least 3 characters.' };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, message: 'That alias is reserved. Choose another one.' };
  }
  return { valid: true, value: slug };
}
