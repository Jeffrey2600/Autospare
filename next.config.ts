import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos are served from /public/uploads (local disk) for now.
    // Add remotePatterns here if/when images move to a cloud host (e.g. Cloudinary, S3).
    qualities: [75, 90],
    // Only the seed script writes SVGs (trusted, generated placeholders) directly to
    // /public/uploads — the upload form itself rejects SVG uploads (see lib/upload.ts).
    // contentDispositionType defaults to "attachment" (forces download) as a safety
    // net for untrusted SVGs; since ours are always our own generated markup (no
    // scripts, no external refs) we render them inline. The CSP still blocks script
    // execution if that ever changes.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      // Admin product forms upload several photos at once as multipart form data.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
