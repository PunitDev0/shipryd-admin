/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Move .next cache to local Mac disk to fix Turbopack RocksDB corruption
  // on USB/external drives (Turbopack SST database fails on external drives)
  distDir: '/Users/punitnigam/.cache/shipryd-admin-next',
};

export default nextConfig;
