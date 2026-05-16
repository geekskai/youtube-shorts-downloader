"use client"
import siteMetadata from "@/data/siteMetadata"
import headerNavLinks from "@/data/headerNavLinks"
import Link from "./Link"
import MobileNav from "./MobileNav"
import SearchButton from "./SearchButton"
import Image from "./Image"
import { useTranslations } from "next-intl"
import LinkNext from "next/link"

const Header = () => {
  return (
    <header className="sticky top-0 z-80 border-b border-slate-800/50 bg-[linear-gradient(90deg,rgba(17,100,102,0.08),transparent,rgba(26,143,122,0.06)),rgba(2,6,23,0.88)] shadow-xl backdrop-blur-xl">
      <HeaderRow />
    </header>
  )
}

function HeaderRow() {
  const t = useTranslations("HomePage")
  return (
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 xl:px-0">
      <Link href="/" aria-label={siteMetadata.headerTitle} className="min-w-0 shrink">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src="/static/logo.png"
            alt=""
            width={36}
            height={36}
            sizes="36px"
            className="h-9 w-9 sm:h-10 sm:w-10"
          />

          {typeof siteMetadata.headerTitle === "string" ? (
            <span className="hidden truncate bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg font-bold text-transparent sm:block">
              {siteMetadata.headerTitle}
            </span>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>

      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
        {headerNavLinks.map((link) => (
          <LinkNext
            key={link.title}
            href={link.href}
            className="group relative min-h-11 px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white md:text-base"
          >
            {t(link.title)}
            <span className="absolute inset-x-3 bottom-1.5 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-transform duration-300 group-hover:scale-x-100" />
          </LinkNext>
        ))}
        <SearchButton />
      </nav>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:hidden">
        <SearchButton />
        <MobileNav />
      </div>
    </div>
  )
}

export default Header
