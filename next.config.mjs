/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfkit reads bundled .afm font-metric files at runtime; keep it out of
  // the webpack bundle so those data files resolve from node_modules.
  serverExternalPackages: ["pdfkit"],
  images: {
    // Supabase Storage signed URLs + placeholders.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
