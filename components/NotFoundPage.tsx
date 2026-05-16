import Image from "next/image"
import { FileVideo, Home, ArrowRight, BookOpen } from "lucide-react"
import type { ReactNode } from "react"

export type NotFoundCopy = {
  badge: string
  title: string
  description: string
  ctaHome: string
  ctaDownload: string
  ctaBlog: string
  hint: string
}

export const DEFAULT_NOT_FOUND_COPY: NotFoundCopy = {
  badge: "404 · Page not found",
  title: "This page isn't available",
  description:
    "The link may be broken, or the page was removed. Go back home and paste a YouTube Shorts URL to download MP4.",
  ctaHome: "Back to homepage",
  ctaDownload: "Open downloader",
  ctaBlog: "Read the blog",
  hint: "Free YouTube Shorts downloader — paste a link, pick quality, save MP4. No sign-up.",
}

const BTN_PRIMARY =
  "inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 sm:w-auto"

const BTN_SECONDARY =
  "inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-primary-400/40 hover:bg-slate-800/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 sm:w-auto"

type NotFoundPageProps = {
  copy?: Partial<NotFoundCopy>
  variant?: "embedded" | "standalone"
  homeLink: ReactNode
  downloadLink: ReactNode
  blogLink: ReactNode
  logoLink?: ReactNode
}

export default function NotFoundPage({
  copy: copyOverride,
  variant = "embedded",
  homeLink,
  downloadLink,
  blogLink,
  logoLink,
}: NotFoundPageProps) {
  const copy = { ...DEFAULT_NOT_FOUND_COPY, ...copyOverride }

  const card = (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center md:max-w-7xl">
        <div className="overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-slate-950/90 p-6 sm:p-8 md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/30 bg-primary-500/10 sm:h-16 sm:w-16">
            <FileVideo
              className="h-7 w-7 text-primary-300 sm:h-8 sm:w-8"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>

          <p className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-200">
            {copy.badge}
          </p>

          <p
            className="mt-4 bg-gradient-to-r from-primary-200/90 via-slate-100 to-primary-300/90 bg-clip-text text-6xl font-bold leading-none tracking-tight text-transparent sm:text-7xl md:text-8xl"
            aria-hidden
          >
            404
          </p>

          <h1 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">{copy.title}</h1>

          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{copy.description}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {homeLink}
            {downloadLink}
            {blogLink}
          </div>

          <p className="mt-6 text-xs leading-6 text-slate-500 sm:text-sm sm:leading-7">{copy.hint}</p>
        </div>
      </div>
    </div>
  )

  if (variant === "standalone") {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <header className="border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 md:py-4 lg:px-8">{logoLink}</div>
        </header>
        <main className="flex flex-1 items-center py-10 sm:py-16">{card}</main>
      </div>
    )
  }

  return (
    <section className="flex min-h-[52vh] items-center py-10 sm:min-h-[56vh] sm:py-14 lg:py-16">
      {card}
    </section>
  )
}

export function notFoundLinks(
  LinkComponent: React.ComponentType<{
    href: string
    className?: string
    children: ReactNode
  }>,
  copy: NotFoundCopy
) {
  return {
    home: (
      <LinkComponent href="/" className={BTN_PRIMARY}>
        <Home className="h-4 w-4 shrink-0" aria-hidden />
        {copy.ctaHome}
      </LinkComponent>
    ),
    download: (
      <LinkComponent href="/#downloader" className={BTN_SECONDARY}>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        {copy.ctaDownload}
      </LinkComponent>
    ),
    blog: (
      <LinkComponent href="/blog" className={BTN_SECONDARY}>
        <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
        {copy.ctaBlog}
      </LinkComponent>
    ),
    logo: (
      <LinkComponent
        href="/"
        className="inline-flex min-h-11 items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30"
      >
        <Image
          src="/static/logo.png"
          alt="YoutubeShortDownloader"
          width={36}
          height={36}
          className="h-9 w-9"
        />
        <span className="text-base font-bold text-white sm:text-lg">YoutubeShortDownloader</span>
      </LinkComponent>
    ),
  }
}
