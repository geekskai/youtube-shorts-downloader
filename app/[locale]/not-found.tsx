import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Link } from "@/app/i18n/navigation"
import NotFoundPage, { notFoundLinks, type NotFoundCopy } from "@/components/NotFoundPage"

export const metadata: Metadata = {
  title: "Page Not Found | YoutubeShortDownloader",
  description: "The page you requested could not be found. Return to the free YouTube Shorts downloader.",
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const t = await getTranslations("NotFoundPage")

  const copy: NotFoundCopy = {
    badge: t("badge"),
    title: t("title"),
    description: t("description"),
    ctaHome: t("cta_home"),
    ctaDownload: t("cta_download"),
    ctaBlog: t("cta_blog"),
    hint: t("hint"),
  }

  const links = notFoundLinks(Link, copy)

  return (
    <NotFoundPage
      variant="embedded"
      copy={copy}
      homeLink={links.home}
      downloadLink={links.download}
      blogLink={links.blog}
    />
  )
}
