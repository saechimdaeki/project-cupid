import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const supabaseRemotePatterns: RemotePattern[] = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const parsedUrl = new URL(supabaseUrl);
    const protocol = parsedUrl.protocol.replace(":", "") as "http" | "https";

    supabaseRemotePatterns.push({
      protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || undefined,
      pathname: "/storage/v1/object/sign/**",
    });
    supabaseRemotePatterns.push({
      protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || undefined,
      pathname: "/storage/v1/object/public/**",
    });
    supabaseRemotePatterns.push({
      protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || undefined,
      pathname: "/storage/v1/render/image/sign/**",
    });
  } catch {
    // Ignore malformed env so local development can still proceed.
  }
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseRemotePatterns,
  },
};

export default nextConfig;
