import AppShell from "@/components/AppShell"
import siteMetadata from "@/data/siteMetadata"
import messages from "@/messages/en.json"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const revalidate = 86400 // 24 hours

export const generateMetadata = async (): Promise<Metadata> => {
  const metadata: Metadata = {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: siteMetadata.title,
      template: `%s`,
    },
    description: siteMetadata.description,
    openGraph: {
      title: siteMetadata.title,
      description: siteMetadata.description,
      url: "./",
      siteName: siteMetadata.title,
      images: [siteMetadata.socialBanner],
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: "./",
      types: {
        "application/rss+xml": `${siteMetadata.siteUrl}/feed.xml`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      title: siteMetadata.title,
      card: "summary_large_image",
      images: [siteMetadata.socialBanner],
    },
  }
  return metadata
}

export default function TagsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      messages={messages}
      mainClassName="mx-auto min-h-[54vh] max-w-7xl px-4 sm:px-6 xl:px-0"
    >
      {children}
    </AppShell>
  )
}
