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

/** Mobile-first section shell (max-w-7xl, aligned with header/footer) */
const SECTION = "mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8"

/** Vertical rhythm — base = mobile, md/lg = tablet & desktop */
const SECTION_PY = "py-8 md:py-11 lg:py-14"

/**
 * Typography — mobile-first; md/lg scale (decimaltools rhythm)
 * Base: readable on 320px+; md/lg add size without crowding mobile.
 */
const TYPE = {
  badge: "text-xs font-semibold uppercase tracking-[0.12em] text-primary-200",
  h1: "text-[1.75rem] font-bold leading-[1.2] tracking-tight text-transparent md:text-4xl md:leading-tight lg:text-5xl",
  h2: "text-xl font-semibold leading-snug text-white md:text-2xl lg:text-[1.75rem] lg:leading-snug",
  sectionIntro: "text-sm leading-7 text-slate-300 md:text-base md:leading-7 lg:max-w-3xl",
  body: "text-sm leading-7 text-slate-300 md:text-base md:leading-7",
  bodyMuted: "text-sm leading-7 text-slate-400 md:text-base md:leading-7",
  meta: "text-xs leading-6 text-slate-500 md:text-sm md:leading-6",
  factLabel: "text-xs font-semibold uppercase tracking-[0.12em]",
  factDetail: "text-sm leading-6 text-slate-300 md:leading-7",
  stepNum:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-200 md:h-11 md:w-11 md:text-base",
  stepTitle: "text-sm font-semibold leading-snug text-slate-100 md:text-base",
  stepBody: "text-sm leading-7 text-slate-400 md:text-[15px] md:leading-7",
  faqQuestion: "text-sm font-semibold leading-snug text-slate-100 md:text-base",
  faqAnswer: "text-sm leading-7 text-slate-400 md:text-base md:leading-7",
  link: "text-sm font-medium text-primary-300 transition hover:text-primary-200 md:text-base",
} as const

/** Section header block — centered on mobile, left on md+ for facts/blog */
const sectionHeaderCenter = "text-center md:text-left"
const sectionHeaderStack = "text-center"

type HeaderProps = {
  id: string
  title: string
  intro?: string
  alignClassName: string
  introClassName?: string
}

function SectionHeader({ id, title, intro, alignClassName, introClassName = "" }: HeaderProps) {
  return (
    <>
      <h2 id={id} className={`${alignClassName} ${TYPE.h2}`}>
        {title}
      </h2>
      {intro ? (
        <p className={`mt-2 md:mt-3 ${alignClassName} ${TYPE.sectionIntro} ${introClassName}`}>
          {intro}
        </p>
      ) : null}
    </>
  )
}

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
    <main className="overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Hero + downloader */}
      <section
        id="downloader"
        aria-labelledby="hero-title"
        className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        <div className={`${SECTION} py-7 md:py-12 lg:py-16`}>
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4 lg:gap-6">
            <header className="text-center">
              <p
                className={`inline-flex max-w-full items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1.5 ${TYPE.badge}`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" aria-hidden />
                <span className="truncate">{t("hero_badge")}</span>
              </p>
              <h1
                id="hero-title"
                className={`mt-3 bg-gradient-to-r from-primary-200 via-slate-100 to-primary-300 bg-clip-text md:mt-4 lg:mt-5 ${TYPE.h1}`}
              >
                {t("hero_title")}
              </h1>

              <aside
                className="fact-chunk mx-auto mt-4 w-full max-w-lg rounded-2xl border border-primary-500/20 bg-primary-500/5 p-4 text-left md:mt-5 md:max-w-none md:p-5 lg:mx-0"
                aria-label="Quick answer"
              >
                <p className={TYPE.body}>
                  <strong className="font-semibold text-primary-200">
                    {t("quick_answer_label")}
                  </strong>{" "}
                  {t("quick_answer_text")}
                </p>
                <ul className={`mt-3 space-y-2.5 md:space-y-2 ${TYPE.bodyMuted}`}>
                  <li>
                    <strong className="font-semibold text-slate-200">
                      {t("quick_answer_best_for_label")}
                    </strong>{" "}
                    {t("quick_answer_best_for")}
                  </li>
                  <li>
                    <strong className="font-semibold text-slate-200">
                      {t("quick_answer_cost_label")}
                    </strong>{" "}
                    {t("quick_answer_cost")}
                  </li>
                  <li>
                    <strong className="font-semibold text-slate-200">
                      {t("quick_answer_benefit_label")}
                    </strong>{" "}
                    {t("quick_answer_benefit")}
                  </li>
                </ul>
                <p className={`mt-3 md:mt-4 ${TYPE.meta}`}>
                  <time dateTime={HOME_LAST_MODIFIED}>
                    {t("content_updated")}: {HOME_LAST_MODIFIED}
                  </time>
                </p>
              </aside>
            </header>

            <div className="mt-6 w-full min-w-0 md:mt-0 lg:col-span-7">
              <ShortsDownloader variant="hero" autoFocus />
            </div>
          </div>
        </div>
      </section>

      {/* Core facts */}
      <section
        id="core-facts"
        aria-labelledby="core-facts-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} ${SECTION_PY}`}>
          <SectionHeader
            id="core-facts-title"
            title={t("core_facts_title")}
            intro={t("core_facts_intro")}
            alignClassName={sectionHeaderCenter}
            introClassName="lg:max-w-4xl"
          />
          <div className="mt-5 grid grid-cols-1 gap-3 md:mt-7 md:grid-cols-2 md:gap-4 lg:mt-8 lg:grid-cols-4 lg:gap-5">
            {CORE_FACTS.map(({ icon: Icon, labelKey, detailKey, border, bg, labelColor }) => (
              <article
                key={labelKey}
                className={`flex gap-3 rounded-2xl border p-4 md:block md:p-5 ${border} ${bg}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 md:mb-3 md:h-6 md:w-6 ${labelColor}`}
                  strokeWidth={2.25}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 md:flex-none">
                  <p className={`${TYPE.factLabel} ${labelColor}`}>{t(labelKey)}</p>
                  <p className={`mt-1.5 md:mt-2 ${TYPE.factDetail}`}>{t(detailKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How-to */}
      <section
        id="how-to"
        aria-labelledby="how-to-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} ${SECTION_PY}`}>
          <SectionHeader
            id="how-to-title"
            title={t("how_to_title")}
            alignClassName={sectionHeaderStack}
          />
          <p
            className={`mx-auto mt-2 max-w-xl md:mt-3 md:max-w-2xl lg:max-w-4xl ${sectionHeaderStack} ${TYPE.sectionIntro}`}
          >
            <strong className="font-semibold text-slate-100">{t("how_to_answer")}</strong>
          </p>
          <ol className="mx-auto mt-5 max-w-xl space-y-3 md:mt-7 md:max-w-2xl md:space-y-4 lg:mt-8 lg:grid lg:max-w-none lg:grid-cols-3 lg:gap-5 lg:space-y-0">
            {HOW_TO_STEPS.map((key, i) => (
              <li
                key={key}
                className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/45 p-4 md:gap-4 md:p-5 lg:flex-col lg:items-start lg:gap-4"
              >
                <span className={TYPE.stepNum}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className={TYPE.stepTitle}>{t(`${key}_title`)}</h3>
                  <p className={`mt-1.5 md:mt-2 ${TYPE.stepBody}`}>{t(`${key}_body`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p
            className={`mx-auto mt-5 max-w-xl text-center md:mt-6 md:max-w-2xl lg:max-w-4xl ${TYPE.meta}`}
          >
            <strong className="font-medium text-slate-400">{t("how_to_takeaway_label")}</strong>{" "}
            {t("how_to_takeaway")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} ${SECTION_PY}`}>
          <SectionHeader
            id="faq-title"
            title={t("faq_title")}
            intro={t("faq_intro")}
            alignClassName={sectionHeaderStack}
            introClassName="mx-auto max-w-xl md:max-w-2xl lg:max-w-4xl"
          />
          <dl className="mx-auto mt-5 max-w-xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/45 md:mt-7 md:max-w-3xl lg:mt-8 lg:max-w-7xl">
            {HOME_FAQ_ITEMS.map((item) => (
              <div key={item.question} className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
                <dt className={TYPE.faqQuestion}>{item.question}</dt>
                <dd className={`mt-2 md:mt-2.5 ${TYPE.faqAnswer}`}>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Blog */}
      {posts.length > 0 && (
        <section className="bg-slate-950" aria-labelledby="blog-section-title">
          <div className={`${SECTION} ${SECTION_PY}`}>
            <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between lg:mb-10">
              <h2 id="blog-section-title" className={`${sectionHeaderCenter} ${TYPE.h2}`}>
                {t("hero_blogs_list")}
              </h2>
              <Link
                href="/blog"
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 px-4 md:min-h-0 md:w-auto md:justify-start md:border-0 md:bg-transparent md:px-0 ${TYPE.link}`}
              >
                {t("blog_all_posts")} →
              </Link>
            </div>
            <div className="home-blog text-sm leading-7 md:text-base [&_a]:text-primary-300 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:text-slate-100 md:[&_h3]:text-lg [&_p]:leading-7 [&_p]:text-slate-400">
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
