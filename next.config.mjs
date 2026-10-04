/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle the build-time-seeded demo DB (see "vercel-build") with the functions.
  outputFileTracingIncludes: { "/**": ["./prisma/demo.db"] },
};

export default nextConfig;
