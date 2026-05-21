/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
