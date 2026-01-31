// Re-export the OpenGraph image for Twitter
// Twitter uses the same image dimensions (1200x630)
export { default, alt, size, contentType } from "./opengraph-image";

// Must define runtime directly, can't re-export
export const runtime = "edge";
