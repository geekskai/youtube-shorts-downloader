import { Authors, allAuthors } from "contentlayer/generated"
import { MDXLayoutRenderer } from "pliny/mdx-components"
import AuthorLayout from "@/layouts/AuthorLayout"
import { coreContent } from "pliny/utils/contentlayer"
import { genPageMetadata } from "app/seo"
import siteMetadata from "@/data/siteMetadata"

const ABOUT_TITLE = "About YoutubeShortDownloader"
const ABOUT_DESCRIPTION =
  "YoutubeShortDownloader is a free YouTube Shorts downloader. Paste a link, save MP4, and learn who maintains the site and how to contact us."

export const metadata = genPageMetadata({
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  openGraph: {
    title: `${ABOUT_TITLE} | ${siteMetadata.title}`,
    description: ABOUT_DESCRIPTION,
    url: `${siteMetadata.siteUrl}/about`,
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: `${ABOUT_TITLE} | ${siteMetadata.title}`,
    description: ABOUT_DESCRIPTION,
    card: "summary_large_image",
    images: [siteMetadata.socialBanner],
  },
  alternates: {
    canonical: `${siteMetadata.siteUrl}/about`,
  },
})

export default function Page() {
  const author = allAuthors.find((p) => p.slug === "default") as Authors
  const mainContent = coreContent(author)

  const siteUrl = siteMetadata.siteUrl.replace(/\/$/, "")
  const logoUrl = `${siteUrl}${siteMetadata.siteLogo.replace(/^\//, "/")}`

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "YoutubeShortDownloader",
    url: siteUrl,
    logo: logoUrl,
    email: siteMetadata.email,
    sameAs: [
      siteMetadata.github,
      siteMetadata.x ?? siteMetadata.twitter,
      siteMetadata.linkedin,
    ].filter(Boolean),
    founder: {
      "@type": "Person",
      name: mainContent.name,
      email: mainContent.email,
      sameAs: [mainContent.github, mainContent.linkedin, mainContent.twitter].filter(Boolean),
      jobTitle: "Maintainer",
      worksFor: { "@type": "Organization", name: "YoutubeShortDownloader", url: siteUrl },
    },
  }

  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: `${siteUrl}/about`,
    isPartOf: {
      "@type": "WebSite",
      name: siteMetadata.title,
      url: siteUrl,
    },
    about: { "@id": `${siteUrl}/#organization` },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...organizationJsonLd,
            "@id": `${siteUrl}/#organization`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJsonLd) }}
      />
      <AuthorLayout content={mainContent} heading={ABOUT_TITLE}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}
