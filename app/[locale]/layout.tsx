import "css/tailwind.css"
import "pliny/search/algolia.css"
import "remark-github-blockquote-alert/alert.css"
import React from "react"
import { Analytics, AnalyticsConfig } from "pliny/analytics"
import { SearchProvider, SearchConfig } from "pliny/search"
import Header from "@/components/Header"
import SectionContainer from "@/components/SectionContainer"
import siteMetadata from "@/data/siteMetadata"
import { Metadata } from "next"
import SiteFooter from "@/components/SiteFooter"
import { NextIntlClientProvider } from "next-intl"
import { hasLocale } from "next-intl"
import { routing, supportedLocales } from "../i18n/routing"
import { notFound } from "next/navigation"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import Script from "next/script"
import ClarityTracker from "../../components/ClarityTracker"
import {
  generateHomeFAQSchema,
  generateHomeHowToSchema,
  HOME_LAST_MODIFIED,
} from "@/lib/seo/home-faq"

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
          url: "/static/images/og/youtubeshortdownloader-home.png",
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
      images: ["/static/images/og/youtubeshortdownloader-home.png"],
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
  const basePath = process.env.BASE_PATH || ""
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
          url: `${baseUrl}/static/images/og/youtubeshortdownloader-home.png`,
        },
        breadcrumb: {
          "@id": `${url}#breadcrumb`,
        },
        inLanguage: inLanguage,
        dateModified: HOME_LAST_MODIFIED,
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
    ],
  }

  return (
    <html lang={locale} className={`scroll-smooth`} suppressHydrationWarning>
      <link rel="apple-touch-icon" sizes="76x76" href={`${basePath}/static/logo.png`} />
      <link
        rel="icon"
        type="image/png"
        sizes="48x48"
        href={`${basePath}/static/favicons/favicon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon.png`}
      />
      <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
      <link
        rel="mask-icon"
        href={`${basePath}/static/favicons/safari-pinned-tab.png`}
        color="#116466"
      />
      <meta name="saashub-verification" content="e4h08bjpev5u" />
      <meta name="msvalidate.01" content="58567D271AD7C1B504E10F5DC587BD0B" />
      <meta name="google-adsense-account" content="ca-pub-2108246014001009"></meta>
      <meta name="google-site-verification" content="QBYZptmNADcvd2h8ZZVSZIJUlv5RnI8yYmHtEld1mKk" />
      <meta name="msapplication-TileColor" content="#000000" />
      <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      <body className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0a0f1f] to-[#000D1A]/90 pl-[calc(100vw-100%)] text-white antialiased">
        {/* JSON-LD Structured Data - Must be in body to avoid hydration error */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* External Scripts using Next.js Script component */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2108246014001009"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"
          strategy="afterInteractive"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClarityTracker />
          <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
          <SectionContainer>
            <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
              <Header />
              <main className="min-h-[54vh] w-full overflow-x-hidden">{children}</main>
            </SearchProvider>
            <SiteFooter />
          </SectionContainer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
