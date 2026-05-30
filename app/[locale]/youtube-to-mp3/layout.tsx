import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { MP3_LAST_MODIFIED } from "@/app/[locale]/youtube-to-mp3/mp3-faq"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const BASE_URL = "https://youtubeshortdownloader.com"
const PAGE_PATH = "/youtube-to-mp3"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Mp3Page")
  const metadataBase = new URL(BASE_URL)

  const title = t("seo_title")
  const description = t("seo_description")
  const keywords = t("seo_keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)

  const canonical =
    locale === "en" ? `${BASE_URL}${PAGE_PATH}` : `${BASE_URL}/${locale}${PAGE_PATH}`

  return {
    metadataBase,
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      siteName: "YoutubeShortDownloader",
      images: [
        {
          url: "/static/images/og/youtube-short-downloader-home.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: ["/static/images/og/youtube-short-downloader-home.png"],
    },
    robots: { index: true, follow: true },
    alternates: { canonical },
    other: {
      "last-modified": MP3_LAST_MODIFIED,
    },
  }
}

export default async function YouTubeToMp3Layout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Mp3Page")

  const url = locale === "en" ? `${BASE_URL}${PAGE_PATH}` : `${BASE_URL}/${locale}${PAGE_PATH}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: t("seo_title"),
        description: t("seo_description"),
        isPartOf: { "@id": `${BASE_URL}/#website` },
        about: { "@id": `${BASE_URL}/#organization` },
        dateModified: MP3_LAST_MODIFIED,
        inLanguage: "en-US",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: t("breadcrumb_title"), item: url },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#app`,
        name: t("hero_title"),
        description: t("seo_description"),
        url,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
