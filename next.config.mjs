/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  ...(isGithubPages && {
    output: 'export',
    basePath: '/startup-graveyard',
    assetPrefix: '/startup-graveyard/',
    images: { unoptimized: true },
  }),
}

export default nextConfig;
