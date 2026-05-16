import Header from "@/components/Header"
import SectionContainer from "@/components/SectionContainer"
import SiteFooter from "@/components/SiteFooter"
import siteMetadata from "@/data/siteMetadata"
import { Analytics, AnalyticsConfig } from "pliny/analytics"
import { SearchProvider, SearchConfig } from "pliny/search"
import type { AbstractIntlMessages } from "next-intl"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"

type AppShellProps = {
  children: ReactNode
  locale?: string
  messages?: AbstractIntlMessages
  mainClassName?: string
}

export default function AppShell({
  children,
  locale = "en",
  messages,
  mainClassName = "min-h-[54vh] w-full overflow-x-hidden",
}: AppShellProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
      <SectionContainer>
        <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
          <Header />
          <main className={mainClassName}>{children}</main>
        </SearchProvider>
        <SiteFooter />
      </SectionContainer>
    </NextIntlClientProvider>
  )
}
