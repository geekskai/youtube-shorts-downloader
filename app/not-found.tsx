import AppShell from "@/components/AppShell"
import NotFoundPage, { DEFAULT_NOT_FOUND_COPY, notFoundLinks } from "@/components/NotFoundPage"
import messages from "@/messages/en.json"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page Not Found | YoutubeShortDownloader",
  description:
    "The page you requested could not be found. Return to the free YouTube Shorts downloader.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  const links = notFoundLinks(Link, DEFAULT_NOT_FOUND_COPY)

  return (
    <AppShell messages={messages}>
      <NotFoundPage
        variant="embedded"
        homeLink={links.home}
        downloadLink={links.download}
        blogLink={links.blog}
      />
    </AppShell>
  )
}
