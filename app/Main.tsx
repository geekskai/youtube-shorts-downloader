import ListLayout from "@/layouts/ListLayout"
import ShortsDownloader from "@/components/ShortsDownloader"
import { HOME_FAQ_ITEMS, HOME_LAST_MODIFIED } from "@/lib/seo/home-faq"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Shield, Zap, Smartphone, FileVideo } from "lucide-react"

const POSTS_PER_PAGE = 6
const MAX_DISPLAY = 3

const CORE_FACTS = [
  {
    icon: Zap,
    labelKey: "fact_instant_label" as const,
    detailKey: "fact_instant_detail" as const,
    border: "border-primary-500/25",
    bg: "bg-primary-500/10",
    labelColor: "text-primary-200",
  },
  {
    icon: Shield,
    labelKey: "fact_free_label" as const,
    detailKey: "fact_free_detail" as const,
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/10",
    labelColor: "text-emerald-200",
  },
  {
    icon: FileVideo,
    labelKey: "fact_format_label" as const,
    detailKey: "fact_format_detail" as const,
    border: "border-cyan-500/25",
    bg: "bg-cyan-500/10",
    labelColor: "text-cyan-200",
  },
  {
    icon: Smartphone,
    labelKey: "fact_device_label" as const,
    detailKey: "fact_device_detail" as const,
    border: "border-orange-500/25",
    bg: "bg-orange-500/10",
    labelColor: "text-orange-200",
  },
] as const

const HOW_TO_STEPS = ["howto_step_1", "howto_step_2", "howto_step_3"] as const

/** PC section container — aligned with header/footer (max-w-7xl) */
const SECTION = "mx-auto w-full max-w-7xl px-4 sm:px-6"

export default function Home({ posts = [] }) {
  const t = useTranslations("HomePage")
  const pageNumber = 1
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <main className="bg-slate-950 text-slate-100">
      {/* Hero + downloader */}
      <section
        id="downloader"
        aria-labelledby="hero-title"
        className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        <div className={`${SECTION} pb-10 pt-7 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12`}>
          <header className="mx-auto max-w-xl text-center lg:max-w-7xl">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-200 sm:px-3.5 sm:text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" aria-hidden />
              <span className="truncate">{t("hero_badge")}</span>
            </p>
            <h1
              id="hero-title"
              className="mt-4 bg-gradient-to-r from-primary-200 via-slate-100 to-primary-300 bg-clip-text text-[1.625rem] font-bold leading-[1.22] tracking-tight text-transparent sm:mt-5 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
            >
              {t("hero_title")}
            </h1>

            {/* Quick Answer — AI-extractable fact chunk */}
            <aside
              className="fact-chunk mx-auto mt-5 w-full max-w-3xl rounded-2xl border border-primary-500/20 bg-primary-500/5 p-4 text-left text-sm leading-relaxed text-slate-300 sm:p-5 sm:text-base lg:max-w-7xl"
              aria-label="Quick answer"
            >
              <p>
                <strong className="text-primary-200">{t("quick_answer_label")}</strong>{" "}
                {t("quick_answer_text")}
              </p>
              <ul className="mt-3 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">{t("quick_answer_best_for_label")}</strong>{" "}
                  {t("quick_answer_best_for")}
                </li>
                <li>
                  <strong className="text-slate-200">{t("quick_answer_cost_label")}</strong>{" "}
                  {t("quick_answer_cost")}
                </li>
                <li>
                  <strong className="text-slate-200">{t("quick_answer_benefit_label")}</strong>{" "}
                  {t("quick_answer_benefit")}
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                <time dateTime={HOME_LAST_MODIFIED}>
                  {t("content_updated")}: {HOME_LAST_MODIFIED}
                </time>
              </p>
            </aside>
          </header>

          <div className="mt-6 w-full sm:mt-8">
            <ShortsDownloader variant="hero" autoFocus />
          </div>
        </div>
      </section>

      {/* Core facts — structured fact chunk */}
      <section
        id="core-facts"
        aria-labelledby="core-facts-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} py-8 sm:py-10`}>
          <h2
            id="core-facts-title"
            className="text-center text-lg font-semibold text-white sm:text-xl"
          >
            {t("core_facts_title")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">
            {t("core_facts_intro")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CORE_FACTS.map(({ icon: Icon, labelKey, detailKey, border, bg, labelColor }) => (
              <article
                key={labelKey}
                className={`rounded-2xl border p-3 text-center sm:p-4 ${border} ${bg}`}
              >
                <Icon className={`mx-auto h-4 w-4 ${labelColor}`} strokeWidth={2.25} aria-hidden />
                <h3 className="mt-2 text-xs font-semibold text-slate-100 sm:text-sm">
                  {t(labelKey)}
                </h3>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-300 sm:text-xs">
                  {t(detailKey)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How-to — answer-first steps for AI + users */}
      <section
        id="how-to"
        aria-labelledby="how-to-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} py-10 sm:py-12`}>
          <h2 id="how-to-title" className="text-center text-lg font-semibold text-white sm:text-xl">
            {t("how_to_title")}
          </h2>
          <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-relaxed text-slate-400 lg:max-w-7xl">
            <strong className="text-slate-200">{t("how_to_answer")}</strong>
          </p>
          <ol className="mx-auto mt-6 max-w-3xl space-y-4 lg:max-w-7xl">
            {HOW_TO_STEPS.map((key, i) => (
              <li
                key={key}
                className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/45 p-4 sm:p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-200">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-100">{t(`${key}_title`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{t(`${key}_body`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-5 max-w-3xl text-center text-xs text-slate-500 lg:max-w-7xl">
            <strong className="text-slate-400">{t("how_to_takeaway_label")}</strong>{" "}
            {t("how_to_takeaway")}
          </p>
        </div>
      </section>

      {/* FAQ — question headings + direct answers */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} py-10 sm:py-12`}>
          <h2 id="faq-title" className="text-center text-lg font-semibold text-white sm:text-xl">
            {t("faq_title")}
          </h2>
          <p className="mx-auto mt-2 max-w-3xl text-center text-sm text-slate-400 lg:max-w-7xl">
            {t("faq_intro")}
          </p>
          <dl className="mx-auto mt-6 max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/45 sm:mt-8 lg:max-w-7xl">
            {HOME_FAQ_ITEMS.map((item) => (
              <div key={item.question} className="px-4 py-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-semibold text-slate-100">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-400">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="bg-slate-950" aria-labelledby="blog-section-title">
          <div className={`${SECTION} py-10 sm:py-12`}>
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="blog-section-title" className="text-lg font-semibold text-white sm:text-xl">
                {t("hero_blogs_list")}
              </h2>
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary-300 transition hover:text-primary-200 sm:min-h-0"
              >
                {t("blog_all_posts")} →
              </Link>
            </div>
            <div className="home-blog [&_a]:text-primary-300 [&_h3]:text-slate-100 [&_p]:text-slate-400">
              <ListLayout
                posts={posts.slice(0, MAX_DISPLAY)}
                initialDisplayPosts={initialDisplayPosts}
                pagination={pagination}
                title={t("blog_all_posts")}
              />
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
