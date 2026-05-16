# YoutubeShortDownloader — Free YouTube Shorts Downloader

<div align="center">

[![Site preview](/public/static/images/geekskai-blog.png)](https://youtubeshortdownloader.com/)

[![GitHub stars](https://img.shields.io/github/stars/geekskai/youtubeshortdownloader?style=social&label=Stars)](https://github.com/geekskai/youtubeshortdownloader)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/geekskai/youtubeshortdownloader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Ready-06B6D4.svg)](https://tailwindcss.com/)

[Live site](https://youtubeshortdownloader.com/) · [中文说明](https://github.com/geekskai/youtubeshortdownloader/blob/main/README-CN.md)

**Built from the [GeeksKai blog](https://github.com/geekskai/blog) stack — refocused on YouTube Shorts downloading and SEO-friendly docs.**

</div>

---

## About this project

**YoutubeShortDownloader** ([youtubeshortdownloader.com](https://youtubeshortdownloader.com/)) is a **Next.js** web app that ships a **free YouTube Shorts downloader**—paste a link, save MP4—plus **MDX** articles and guides. The codebase was **migrated and adapted** from the open-source blog template **[geekskai/blog](https://github.com/geekskai/blog)** (same App Router, Contentlayer2, Tailwind, and content pipeline), then **rebranded and trimmed** for this product.

If the original blog template helped you, consider starring **[geekskai/blog](https://github.com/geekskai/blog)** as well as this repo.

## Features

- **Downloader** — Paste a YouTube Shorts link and save the video as MP4, with UX tuned for quick mobile and desktop use.
- **Content** — Blog-style **MDX** posts under `data/blog` (math via KaTeX, SEO metadata, optional FAQ front matter).
- **i18n** — [next-intl](https://next-intl-docs.vercel.app/)–based locale routing under `app/[locale]`.
- **Performance & SEO** — Next.js 14 App Router, static generation where configured, sitemap/IndexNow scripts as in repo.

## Tech stack

| Area | Stack |
|------|--------|
| Framework | **Next.js 14** (App Router), **React 18**, **TypeScript** |
| Content | **contentlayer2** + **MDX** |
| Styling | **Tailwind CSS 3** |
| i18n | **next-intl** |
| Analytics / extras | **Pliny** (optional integrations) |

## Quick start

```bash
git clone https://github.com/geekskai/youtubeshortdownloader.git
cd youtubeshortdownloader
yarn
yarn dev
```

**Windows (PowerShell)** — if your environment needs it:

```powershell
$env:PWD = (Get-Location).Path
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) (exact port may vary).

## Project layout (high level)

- `app/[locale]/` — Pages, layouts, and tool routes.
- `data/blog/` — MDX posts and front matter.
- `contentlayer.config.ts` — Content models and MDX pipeline.
- `messages/` — Locale strings for `next-intl`.
- `scripts/` — Build helpers (e.g. post-build, IndexNow).

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/geekskai/youtubeshortdownloader)

Set environment variables in the Vercel project dashboard as needed (analytics, Giscus, API keys for optional features). Copy from `.env.example` if present in the repo, or add only what you enable.

### Static / other hosts

Some setups use:

```bash
EXPORT=1 UNOPTIMIZED=1 yarn build
```

Confirm with your hosting docs and `next.config.js` for this project.

## Contributing

Issues and PRs are welcome: bug fixes, docs, accessibility, and new tools that fit the YoutubeShortDownloader scope.

## License

[MIT](https://github.com/geekskai/youtubeshortdownloader/blob/main/LICENSE) © [geeks kai](https://youtubeshortdownloader.com)

### Upstream & attribution

- **Blog foundation**: [geekskai/blog](https://github.com/geekskai/blog) — original Next.js + Contentlayer blog template this project grew from.
- **Third-party components**: Some tools may bundle or adapt other MIT-licensed projects; see per-tool `ATTRIBUTION.md` or license files where applicable.

---

<div align="center">

Made with care for [YoutubeShortDownloader](https://youtubeshortdownloader.com/)

</div>
