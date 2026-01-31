import { LOBSTER_PHRASES, ERROR_CODES } from './constants';
import type { ApiResponse } from './types';

/**
 * Get a random lobster phrase
 */
export function getRandomLobsterPhrase(): string {
  return LOBSTER_PHRASES[Math.floor(Math.random() * LOBSTER_PHRASES.length)];
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug with a random suffix
 */
export function generateUniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Generate an order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CL-${timestamp}-${random}`;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format crypto price
 */
export function formatCryptoPrice(amount: number, currency: string): string {
  const decimals = currency === 'ETH' ? 6 : 2;
  return `${amount.toFixed(decimals)} ${currency}`;
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: keyof typeof ERROR_CODES,
  message: string,
  details?: unknown
): ApiResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES[code],
      message,
      details,
    },
  };
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Parse pagination params with defaults
 */
export function parsePagination(
  page?: string | number,
  limit?: string | number,
  defaultLimit: number = 20,
  maxLimit: number = 100
): { page: number; limit: number; skip: number } {
  const parsedPage = Math.max(1, parseInt(String(page || 1), 10));
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(String(limit || defaultLimit), 10)));
  
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
}

/**
 * Calculate time ago string
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a random API key
 */
export function generateApiKey(prefix: string = 'clwd'): string {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${randomPart}`;
}
