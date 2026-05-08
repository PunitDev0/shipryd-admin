/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Move .next cache to local Mac disk to fix Turbopack RocksDB corruption
  // on USB/external drives (Turbopack SST database fails on external drives).
  // We only do this locally. On Vercel/Production, we use the default .next.
  distDir: process.env.NODE_ENV === 'development' 
    ? '/Users/punitnigam/.cache/shipryd-admin-next' 
    : '.next',
};

export default nextConfig;
