import AppShell from "@/components/AppShell"
import ClarityTracker from "@/components/ClarityTracker"
import { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import React from "react"
import { routing } from "../i18n/routing"
import { HOME_LAST_MODIFIED_ISO, generateHomeFAQSchema } from "@/app/[locale]/home-faq"

export const revalidate = 86400 // 24 hours

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}
// const supportedLocales = ["en", "ja", "ko", "no", "zh-cn"] // Add more as you implement them

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations("HomePage")
  const metadataBase = new URL("https://youtubeshortdownloader.com")

  const title = t("home_seo_title")
  const description = t("home_seo_description")
  const keywords = t("home_seo_keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)

  const isDefaultLocale = locale === "en"
  // const languages = {
  //   "x-default": "https://youtubeshortdownloader.com/",
  // }

  // supportedLocales.forEach((locale) => {
  //   languages[locale] = `https://youtubeshortdownloader.com/${locale}`
  // })

  return {
    metadataBase,
    title: title,
    description: description,
    keywords,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      url: "https://youtubeshortdownloader.com",
      siteName: "YoutubeShortDownloader",
      images: [
        {
          url: "/static/images/og/youtube-short-downloader-home.png",
          width: 1200,
          height: 630,
          alt: "YoutubeShortDownloader",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      title: title,
      description: description,
      card: "summary_large_image",
      images: ["/static/images/og/youtube-short-downloader-home.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: [{ name: "YoutubeShortDownloader" }],
    creator: "YoutubeShortDownloader",
    publisher: "YoutubeShortDownloader",
    alternates: {
      canonical: isDefaultLocale
        ? "https://youtubeshortdownloader.com"
        : `https://youtubeshortdownloader.com/${locale}`,
      // languages: {
      //   ...languages,
      // },
    },
    category: "Multimedia",
    classification: "Video Downloader",
    other: {
      "application-name": "YoutubeShortDownloader",
      "apple-mobile-web-app-title": "YoutubeShortDownloader",
      "last-modified": HOME_LAST_MODIFIED_ISO,
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  const messages = await getMessages()

  // Generate JSON-LD Structured Data
  const t = await getTranslations("HomePage")
  const baseUrl = "https://youtubeshortdownloader.com"
  const url = `${baseUrl}${locale === "en" ? "" : `/${locale}`}`

  const downloaderFeatures = [
    {
      "@type": "SoftwareApplication",
      position: 1,
      name: "YouTube Shorts Downloader",
      description: t("home_seo_description"),
      url: `${baseUrl}${locale === "en" ? "" : `/${locale}`}`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  ]

  const localeMap: Record<string, string> = {
    en: "en-US",
    ja: "ja-JP",
    ko: "ko-KR",
    no: "nb-NO",
    "zh-cn": "zh-CN",
    da: "da-DK",
  }

  const inLanguage = localeMap[locale] || "en-US"

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "YoutubeShortDownloader",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/static/logo.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://github.com/youtubeshortdownloader",
          "https://twitter.com/youtubeshortdownloader",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Service",
          availableLanguage: ["en", "ja", "ko", "zh-cn", "no", "da"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "YoutubeShortDownloader",
        description: t("home_seo_description"),
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        inLanguage: inLanguage,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url: url,
        name: t("home_seo_title"),
        description: t("home_seo_description"),
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        about: {
          "@id": `${baseUrl}/#organization`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${baseUrl}/static/images/og/youtube-short-downloader-home.png`,
        },
        breadcrumb: {
          "@id": `${url}#breadcrumb`,
        },
        inLanguage: inLanguage,
        dateModified: HOME_LAST_MODIFIED_ISO,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: url,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#features`,
        name: t("footer_popular_tools"),
        description: t("footer_description"),
        numberOfItems: downloaderFeatures.length.toString(),
        itemListElement: downloaderFeatures,
      },
      generateHomeFAQSchema(url),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClarityTracker />
      <AppShell locale={locale} messages={messages}>
        {children}
      </AppShell>
    </>
  )
}
