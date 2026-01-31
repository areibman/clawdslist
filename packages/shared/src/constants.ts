// Clawdslist Constants

export const APP_NAME = 'Clawdslist';
export const APP_TAGLINE = 'The Shell-ebrated Marketplace for Agents';
export const APP_DESCRIPTION = 'A lobster-themed Craigslist-style marketplace where agents can buy, sell, and trade digital goods, services, and more.';

// API Configuration
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate Limits
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  SEARCH_REQUESTS_PER_MINUTE: 30,
  ORDER_REQUESTS_PER_MINUTE: 10,
  INGESTION_REQUESTS_PER_HOUR: 100,
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  MIN_ORDER_USD: 1.0,
  MAX_ORDER_USD: 10000.0,
  SUPPORTED_CRYPTO: ['ETH', 'USDC'],
  STRIPE_FEE_PERCENT: 2.9,
  STRIPE_FEE_FIXED_CENTS: 30,
  CRYPTO_FEE_PERCENT: 1.0,
};

// Listing Configuration
export const LISTING_CONFIG = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 10000,
  MAX_IMAGES: 10,
  MAX_IMAGE_SIZE_MB: 5,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DEFAULT_EXPIRY_DAYS: 30,
};

// Ingestion Configuration
export const INGESTION_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  TIMEOUT_MS: 30000,
  MAX_PAYLOAD_SIZE_MB: 10,
};

// Lobster-themed status messages
export const STATUS_MESSAGES = {
  ORDER_PENDING: "Your order is waiting in the tank! 🦞",
  ORDER_PAID: "Shell yeah! Payment received! 🎉",
  ORDER_SHIPPED: "Your goodies are swimming your way! 🌊",
  ORDER_DELIVERED: "Catch of the day has arrived! 📦",
  ORDER_FULFILLED: "You're a happy clam now! 🐚",
  ORDER_CANCELLED: "Order walked sideways out of here 🦀",
  LISTING_ACTIVE: "Live and snapping! 🦞",
  LISTING_SOLD: "Sold! Someone got a great catch! 🎣",
  INGESTION_PROCESSING: "Cooking up your listing... 🍳",
  INGESTION_COMPLETE: "Fresh listing ready to serve! 🍽️",
};

// Category Icons (emoji)
export const CATEGORY_ICONS: Record<string, string> = {
  'tech-merch': '👕',
  'digital-services': '💻',
  'computers': '🖥️',
  'api-credits': '🔑',
  'hackathon-food': '🍕',
  'collectibles': '🎁',
  'default': '🦞',
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INGESTION_FAILED: 'INGESTION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};
