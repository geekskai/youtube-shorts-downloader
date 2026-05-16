import AppShell from "@/components/AppShell"
import siteMetadata from "@/data/siteMetadata"
import messages from "@/messages/en.json"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "Geekskai Terms of Service | 100% Free Online Tools"
  const description =
    "Read the Geekskai Terms of Service. Discover our commitment to providing 100% free online tools, downloaders, and converters with no hidden fees or subscriptions."

  const metadata: Metadata = {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: title,
      template: `%s`,
    },
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: "https://youtubeshortdownloader.com/terms/",
      siteName: siteMetadata.title,
      images: [siteMetadata.socialBanner],
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: "https://youtubeshortdownloader.com/terms/",
      languages: {
        "x-default": "https://youtubeshortdownloader.com/terms/",
      },
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
      title: title,
      description: description,
      card: "summary_large_image",
      images: [siteMetadata.socialBanner],
    },
  }
  return metadata
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      messages={messages}
      mainClassName="mx-auto min-h-[54vh] max-w-7xl px-4 sm:px-6 xl:px-0"
    >
      {children}
    </AppShell>
  )
}
