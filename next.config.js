const { withContentlayer } = require("next-contentlayer2")
const createNextIntlPlugin = require("next-intl/plugin")
const withNextIntl = createNextIntlPlugin("./app/i18n/request.ts")

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const output = process.env.EXPORT ? "export" : undefined
const basePath = process.env.BASE_PATH || undefined
// const unoptimized = process.env.UNOPTIMIZED ? true : undefined

module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer, withNextIntl]
  /** @type {import("next").NextConfig} */
  const nextConfig = plugins.reduce((config, plugin) => plugin(config), {
    async redirects() {
      return [
        {
          source: "/:path*/feed.xml/",
          destination: "/:path*/feed.xml",
          permanent: true,
        },
        { source: "/tools", destination: "/", permanent: true },
        { source: "/tools/", destination: "/", permanent: true },
        { source: "/tools/:path*", destination: "/", permanent: true },
      ]
    },
    output,
    basePath,
    // trailingSlash: true,
    reactStrictMode: true,
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "picsum.photos",
        },
        {
          protocol: "https",
          hostname: "openweathermap.org",
        },
        {
          protocol: "https",
          hostname: "api.producthunt.com",
        },
        { protocol: "https", hostname: "i.ytimg.com" },
        { protocol: "https", hostname: "img.youtube.com" },
      ],
      // 启用图片优化以减少 Fast Origin Transfer 费用
      // 仅在明确需要时才禁用优化（如静态导出）
      unoptimized: output === "export" ? true : false,
      // 优化图片格式和缓存
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    webpack: (config, { isServer }) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      })

      // Optimize bundle size for Cloudflare Workers
      if (isServer) {
        // Exclude large client-side only dependencies from server bundle
        config.externals = config.externals || []
        config.externals.push({
          jsdom: "commonjs jsdom",
        })

        // Optimize module resolution
        config.resolve = config.resolve || {}
        config.resolve.extensionAlias = {
          ...config.resolve.extensionAlias,
          ".js": [".js", ".ts", ".tsx"],
        }
        config.resolve.alias = {
          ...config.resolve.alias,
          // Use lighter alternatives where possible
        }
      }

      return config
    },
    experimental: {
      optimizePackageImports: ["lucide-react", "react-icons", "@headlessui/react", "date-fns"],
    },
    // Compress output
    compress: true,
    // 忽略 TypeScript 构建错误（用于第三方库的类型问题）
    typescript: {
      ignoreBuildErrors: true,
    },
    // 添加缓存头以减少 Fast Origin Transfer 费用
    // async headers() {
    //   return [
    //     {
    //       // 静态资源长期缓存
    //       source: "/static/:path*",
    //       headers: [
    //         {
    //           key: "Cache-Control",
    //           value: "public, max-age=31536000, immutable",
    //         },
    //       ],
    //     },
    //     {
    //       // 字体文件长期缓存
    //       source: "/fonts/:path*",
    //       headers: [
    //         {
    //           key: "Cache-Control",
    //           value: "public, max-age=31536000, immutable",
    //         },
    //       ],
    //     },
    //     {
    //       // 图片资源缓存
    //       source: "/_next/image",
    //       headers: [
    //         {
    //           key: "Cache-Control",
    //           value: "public, max-age=31536000, immutable",
    //         },
    //       ],
    //     },
    //     {
    //       // Next.js 静态资源
    //       source: "/_next/static/:path*",
    //       headers: [
    //         {
    //           key: "Cache-Control",
    //           value: "public, max-age=31536000, immutable",
    //         },
    //       ],
    //     },
    //   ]
    // },
  })

  return nextConfig
}
