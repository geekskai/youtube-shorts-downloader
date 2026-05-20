import ListLayout from "@/layouts/ListLayout"
import ShortsDownloader from "@/components/ShortsDownloader"
import { HOME_FAQ_ITEMS, HOME_LAST_MODIFIED } from "@/lib/seo/home-faq"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Check, Gauge, Shield, Sparkles, Smartphone } from "lucide-react"

const POSTS_PER_PAGE = 6
const MAX_DISPLAY = 3

const FEATURE_KEYS = [
  "feature_hd",
  "feature_no_watermark",
  "feature_fast",
  "feature_mobile",
  "feature_no_signup",
  "feature_iphone_android",
  "feature_browser",
] as const

const WHY_ITEMS = [
  { icon: Gauge, titleKey: "why_speed_title" as const, bodyKey: "why_speed_body" as const },
  { icon: Sparkles, titleKey: "why_simple_title" as const, bodyKey: "why_simple_body" as const },
  { icon: Shield, titleKey: "why_safe_title" as const, bodyKey: "why_safe_body" as const },
  {
    icon: Smartphone,
    titleKey: "why_compat_title" as const,
    bodyKey: "why_compat_body" as const,
  },
] as const

const RELATED_TOOLS = [
  {
    href: "/youtube-video-downloader",
    titleKey: "related_video_title" as const,
    descKey: "related_video_desc" as const,
  },
  {
    href: "/youtube-audio-downloader",
    titleKey: "related_audio_title" as const,
    descKey: "related_audio_desc" as const,
  },
] as const

const HOW_TO_STEPS = ["howto_step_1", "howto_step_2", "howto_step_3"] as const

/** Mobile-first section shell (max-w-7xl, aligned with header/footer) */
const SECTION = "mx-auto w-full max-w-7xl px-4 sm:px-6"

/** Vertical rhythm — base = mobile, md/lg = tablet & desktop */
const SECTION_PY = "py-8 md:py-11 lg:py-14"

/**
 * Typography — mobile-first; md/lg scale (decimaltools rhythm)
 * Base: readable on 320px+; md/lg add size without crowding mobile.
 */
const TYPE = {
  badge: "text-xs font-semibold uppercase tracking-[0.12em] text-primary-200",
  h1: "text-2xl font-bold leading-[1.2] tracking-tight text-transparent md:text-3xl md:leading-tight lg:text-4xl",
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
        <div className={`${SECTION} py-7 md:py-8`}>
          <div className="flex flex-col gap-4">
            <header className="text-center">
              <p
                className={`inline-flex max-w-full items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1.5 md:px-3.5 ${TYPE.badge}`}
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
              <p className={`mx-auto mt-3 max-w-2xl md:mt-4 lg:max-w-6xl ${TYPE.sectionIntro}`}>
                {t("hero_subtitle")}
              </p>

              <section
                className="fact-chunk mx-auto mt-4 w-full max-w-lg rounded-2xl border border-primary-500/20 bg-primary-500/5 p-4 text-left md:mt-5 md:max-w-none md:p-5"
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
              </section>
            </header>

            <div className="w-full min-w-0 lg:col-span-7">
              <ShortsDownloader variant="hero" autoFocus />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        aria-labelledby="features-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} ${SECTION_PY}`}>
          <SectionHeader
            id="features-title"
            title={t("features_title")}
            intro={t("features_intro")}
            alignClassName={sectionHeaderCenter}
            introClassName="lg:max-w-4xl"
          />
          <ul className="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 md:mt-7 lg:mt-8 lg:max-w-5xl lg:grid-cols-2 lg:gap-4">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3.5 md:px-5 md:py-4"
              >
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary-300"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className={TYPE.body}>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why use */}
      <section
        id="why-use"
        aria-labelledby="why-use-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} ${SECTION_PY}`}>
          <SectionHeader
            id="why-use-title"
            title={t("why_title")}
            intro={t("why_intro")}
            alignClassName={sectionHeaderCenter}
            introClassName="lg:max-w-4xl"
          />
          <div className="mt-5 grid grid-cols-1 gap-3 md:mt-7 md:grid-cols-2 md:gap-4 lg:mt-8 lg:gap-5">
            {WHY_ITEMS.map(({ icon: Icon, titleKey, bodyKey }) => (
              <article
                key={titleKey}
                className="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-slate-900/50 p-4 md:p-5"
              >
                <Icon className="mb-3 h-6 w-6 text-primary-300" strokeWidth={2} aria-hidden />
                <h3 className={TYPE.stepTitle}>{t(titleKey)}</h3>
                <p className={`mt-2 ${TYPE.stepBody}`}>{t(bodyKey)}</p>
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

      {/* Related tools / internal links */}
      <section
        id="related-tools"
        aria-labelledby="related-tools-title"
        className="border-b border-white/10 bg-slate-950"
      >
        <div className={`${SECTION} ${SECTION_PY}`}>
          <SectionHeader
            id="related-tools-title"
            title={t("related_tools_title")}
            intro={t("related_tools_intro")}
            alignClassName={sectionHeaderStack}
            introClassName="mx-auto max-w-xl md:max-w-2xl lg:max-w-4xl"
          />
          <div className="mx-auto mt-5 grid max-w-xl grid-cols-1 gap-3 md:mt-7 md:max-w-3xl md:grid-cols-2 md:gap-4 lg:mt-8 lg:max-w-7xl">
            {RELATED_TOOLS.map(({ href, titleKey, descKey }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-white/10 bg-slate-900/45 p-4 transition hover:border-primary-500/40 hover:bg-primary-500/5 md:p-5"
              >
                <h3 className={`${TYPE.stepTitle} group-hover:text-primary-200`}>
                  {t(titleKey)} →
                </h3>
                <p className={`mt-2 ${TYPE.stepBody}`}>{t(descKey)}</p>
              </Link>
            ))}
          </div>
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
