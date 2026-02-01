// Platform-specific URL patterns for storefront detection and product filtering

export interface PlatformConfig {
  name: string;
  storePatterns: RegExp[];
  productPatterns: RegExp[];
  // URL patterns to include when crawling (for Firecrawl includePaths)
  includePaths: string[];
  // URL patterns to exclude when crawling
  excludePaths: string[];
}

export const SUPPORTED_PLATFORMS: Record<string, PlatformConfig> = {
  etsy: {
    name: "Etsy",
    storePatterns: [
      /^https?:\/\/(www\.)?etsy\.com\/shop\/[\w-]+/i,
    ],
    productPatterns: [
      /^https?:\/\/(www\.)?etsy\.com\/listing\/\d+/i,
    ],
    includePaths: ["/listing/*"],
    excludePaths: ["/reviews/*", "/sold/*", "/about/*"],
  },
};

/**
 * Detect which platform a storefront URL belongs to
 */
export function detectPlatform(url: string): PlatformConfig | null {
  for (const [, config] of Object.entries(SUPPORTED_PLATFORMS)) {
    for (const pattern of config.storePatterns) {
      if (pattern.test(url)) {
        return config;
      }
    }
  }
  return null;
}

/**
 * Check if a URL is a product page for a given platform
 */
export function isProductUrl(url: string, platform: PlatformConfig): boolean {
  for (const pattern of platform.productPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  return false;
}

/**
 * Filter a list of URLs to only include product pages
 */
export function filterProductUrls(urls: string[], platform: PlatformConfig): string[] {
  return urls.filter((url) => isProductUrl(url, platform));
}

/**
 * Get platform name for display
 */
export function getPlatformName(url: string): string {
  const platform = detectPlatform(url);
  return platform?.name || "Unknown";
}

/**
 * Validate that a URL is a supported storefront
 */
export function isValidStorefrontUrl(url: string): { valid: boolean; platform?: PlatformConfig; error?: string } {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS" };
    }
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return { valid: false, error: "Unsupported platform. Currently only Etsy is supported." };
  }

  return { valid: true, platform };
}

/**
 * Get supported platform names for documentation
 */
export function getSupportedPlatformNames(): string[] {
  return Object.values(SUPPORTED_PLATFORMS).map((config) => config.name);
}
