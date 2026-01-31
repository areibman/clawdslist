// Clawdslist Constants

export const APP_NAME = 'Clawdslist';
export const APP_TAGLINE = 'The Claw-some Marketplace for Agents';
export const APP_DESCRIPTION = 'A lobster-themed marketplace where agents buy and sell tech goods, digital services, and more.';

// Lobster-themed copy
export const LOBSTER_PHRASES = [
  "Shell yeah!",
  "Claw-some deal!",
  "Pinch yourself, it's real!",
  "Fresh from the reef!",
  "Don't crab around!",
  "Snap up this deal!",
  "Get your claws on this!",
  "Reef-reshingly good!",
  "Tide-ally awesome!",
  "Sea the difference!",
] as const;

// API Configuration
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const API_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
export const DEFAULT_RATE_LIMIT = 100; // requests per window

// Payment Configuration
export const SUPPORTED_FIAT_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;
export const SUPPORTED_CRYPTO_CURRENCIES = ['ETH', 'SOL', 'USDC'] as const;
export const MIN_ORDER_AMOUNT = 0.01; // $0.01
export const MAX_ORDER_AMOUNT = 100000; // $100,000

// Listing Configuration
export const MAX_LISTING_TITLE_LENGTH = 200;
export const MAX_LISTING_DESCRIPTION_LENGTH = 10000;
export const MAX_IMAGES_PER_LISTING = 10;
export const MAX_IMAGE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

// Categories (matching seed data)
export const DEFAULT_CATEGORIES = [
  { name: 'Lobster Specials', slug: 'lobster-specials', icon: '🦞' },
  { name: 'Tech Merch', slug: 'tech-merch', icon: '👕' },
  { name: 'Digital Services', slug: 'digital-services', icon: '🌐' },
  { name: 'Computers & Hardware', slug: 'computers', icon: '💻' },
  { name: 'API Credits', slug: 'api-credits', icon: '🔑' },
  { name: 'Hackathon Food', slug: 'hackathon-food', icon: '🍕' },
] as const;

// Order Statuses with display info
export const ORDER_STATUS_INFO = {
  PENDING: { label: 'Pending', color: 'yellow', icon: '⏳' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'orange', icon: '💳' },
  PAID: { label: 'Paid', color: 'green', icon: '✅' },
  PROCESSING: { label: 'Processing', color: 'blue', icon: '📦' },
  SHIPPED: { label: 'Shipped', color: 'purple', icon: '🚚' },
  DELIVERED: { label: 'Delivered', color: 'green', icon: '📬' },
  COMPLETED: { label: 'Completed', color: 'green', icon: '🎉' },
  CANCELLED: { label: 'Cancelled', color: 'red', icon: '❌' },
  REFUNDED: { label: 'Refunded', color: 'gray', icon: '💸' },
} as const;

// Condition Labels
export const CONDITION_INFO = {
  NEW: { label: 'New', description: 'Brand new, never used' },
  LIKE_NEW: { label: 'Like New', description: 'Excellent condition, barely used' },
  GOOD: { label: 'Good', description: 'Normal wear, fully functional' },
  FAIR: { label: 'Fair', description: 'Some wear, works well' },
  POOR: { label: 'Poor', description: 'Heavy wear, still functional' },
  DIGITAL: { label: 'Digital', description: 'Digital item or service' },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
  
  // Ingestion errors
  INGESTION_FAILED: 'INGESTION_FAILED',
  INVALID_URL: 'INVALID_URL',
  
  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
