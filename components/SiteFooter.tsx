import Link from "./Link"
import SocialIcon from "./social-icons"
import siteMetadata from "@/data/siteMetadata"
import Image from "./Image"
import { Zap, Heart, ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"
import LinkNext from "next/link"
import { toolsData } from "@/data/toolsData"

const SiteFooter = () => {
  const t = useTranslations("HomePage")
  return (
    <footer
      className="mt-16 overflow-hidden border-t border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black"
      style={{
        backgroundImage:
          "radial-gradient(circle at top right, rgba(17,100,102,0.14), transparent 24rem), radial-gradient(circle at bottom left, rgba(26,143,122,0.1), transparent 24rem)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2">
              <Image
                src="/static/logo.png"
                alt="YoutubeShortDownloader Logo"
                width={36}
                height={36}
                sizes="36px"
                className="h-9 w-9"
              />
              <span className="text-lg font-bold text-white">YoutubeShortDownloader</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t("footer_description")}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1.5 text-sm font-medium text-primary-200">
              <Zap className="h-3.5 w-3.5" />
              {t("footer_100_free_forever")}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              {t("footer_popular_tools")}
            </h3>
            <ul className="mt-4 space-y-2">
              {toolsData.slice(0, 4).map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-slate-400 transition hover:text-primary-300"
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary-300 hover:text-primary-200 sm:min-h-0"
            >
              {t("footer_view_all_tools")}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              {t("footer_resources")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <LinkNext href="/blog" className="hover:text-primary-300">
                  {t("footer_blog")}
                </LinkNext>
              </li>
              <li>
                <LinkNext href="/tags" className="hover:text-primary-300">
                  {t("footer_tags")}
                </LinkNext>
              </li>
              <li>
                <LinkNext href="/about" className="hover:text-primary-300">
                  {t("footer_about")}
                </LinkNext>
              </li>
              <li>
                <LinkNext href="/privacy/" className="hover:text-primary-300">
                  {t("footer_privacy_policy")}
                </LinkNext>
              </li>
              <li>
                <LinkNext href="/terms" className="hover:text-primary-300">
                  {t("footer_terms_of_service")}
                </LinkNext>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              {t("footer_connect_with_us")}
            </h3>
            <div className="mt-4 flex gap-2">
              {[
                { kind: "mail" as const, href: `mailto:${siteMetadata.email}` },
                { kind: "github" as const, href: siteMetadata.github },
                { kind: "twitter" as const, href: siteMetadata.twitter },
                { kind: "linkedin" as const, href: siteMetadata.linkedin },
              ].map((s) => (
                <div
                  key={s.kind}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-2 transition hover:border-primary-500/30 hover:bg-slate-800"
                >
                  <SocialIcon kind={s.kind} href={s.href} size={5} />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Heart className="h-4 w-4 text-primary-400" />
                {t("footer_built_with_love")}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {t("footer_built_with_love_description")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800/50 pt-8 text-sm text-slate-500 md:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            <Link href="/" className="font-medium text-slate-300 hover:text-primary-300">
              YoutubeShortDownloader
            </Link>
            {" · "}
            {t("footer_all_rights_reserved")}
          </p>
          <p className="flex items-center gap-2 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            {t("footer_status_all_systems_operational")}
          </p>
        </div>

        <a href="https://sellwithboost.com" target="_blank" rel="noopener noreferrer nofollow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://sellwithboost.com/badge/listing.svg"
            alt="Listed on Sell With boost"
            style={{ height: "40px", width: "auto" }}
          />
        </a>
      </div>
    </footer>
  )
}

export default SiteFooter
