"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Download,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  ArrowRight,
} from "lucide-react"
import { useTranslations } from "next-intl"

type QualityOption = { id: string; label: string; size: number | null }

type VideoPreview = {
  videoId: string
  title: string
  thumbnail: string | null
  author: string | null
  durationSeconds: number | null
  qualities: QualityOption[]
  defaultQualityId: string
}

type ApiErrorCode =
  | "invalid_url"
  | "api_not_configured"
  | "no_qualities"
  | "upstream"
  | "fetch_failed"

function formatDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number | null): string | null {
  if (bytes == null || bytes <= 0) return null
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

function downloadHref(videoId: string, qualityId: string): string {
  const q = new URLSearchParams({ videoId, quality: qualityId })
  return `/api/video/download?${q}`
}

function mapApiError(code: string | undefined): ApiErrorCode {
  if (code === "invalid_url" || code === "invalid_body") return "invalid_url"
  if (code === "api_not_configured") return "api_not_configured"
  if (code === "no_qualities") return "fetch_failed"
  return "fetch_failed"
}

type VideoDownloaderProps = {
  variant?: "hero" | "default"
  autoFocus?: boolean
}

const BTN =
  "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-[background-color,border-color,opacity] duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-45"

type VideoResultCardProps = {
  video: VideoPreview
  qualityId: string
  downloading: boolean
  onQualityChange: (id: string) => void
  onDownload: () => void
  t: ReturnType<typeof useTranslations<"VideoDownloader">>
  btnClass: string
}

function VideoResultCard({
  video,
  qualityId,
  downloading,
  onQualityChange,
  onDownload,
  t,
  btnClass,
}: VideoResultCardProps) {
  const duration = formatDuration(video.durationSeconds)
  const selected = video.qualities.find((q) => q.id === qualityId)
  const selectedSize = formatFileSize(selected?.size ?? null)

  return (
    <article className="overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-br from-slate-950/90 via-slate-900/50 to-slate-950/90">
      <header className="border-b border-white/10 px-4 py-2.5 sm:px-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/35 bg-primary-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-100">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("ready")}
        </span>
      </header>

      <div className="p-4 sm:p-5">
        {/* Preview row: thumb + meta (mobile & desktop) */}
        <div className="flex gap-3.5 sm:gap-5">
          {video.thumbnail ? (
            <div className="relative h-[72px] w-[128px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg shadow-black/40 sm:h-[90px] sm:w-[160px]">
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="(max-width: 640px) 128px, 160px"
                className="object-cover"
                unoptimized
              />
              {duration && (
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                  {duration}
                </span>
              )}
            </div>
          ) : (
            <div
              className="flex h-[72px] w-[128px] shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-900/80 sm:h-[90px] sm:w-[160px]"
              aria-hidden
            >
              <Download className="h-8 w-8 text-slate-600" />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
            <h3 className="line-clamp-3 text-[15px] font-semibold leading-snug text-slate-50 sm:line-clamp-2 sm:text-base">
              {video.title}
            </h3>
            {video.author && (
              <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">{video.author}</p>
            )}
          </div>
        </div>

        {/* Actions: stacked on mobile, row on lg */}
        {video.qualities.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:mt-5 sm:pt-5 lg:flex-row lg:items-end lg:gap-4">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="video-quality-select"
                className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium text-slate-400"
              >
                <span>{t("quality_label")}</span>
                {selectedSize && (
                  <span className="tabular-nums text-slate-500">{selectedSize}</span>
                )}
              </label>
              <select
                id="video-quality-select"
                value={qualityId}
                onChange={(e) => onQualityChange(e.target.value)}
                className="min-h-11 w-full touch-manipulation rounded-xl border border-white/15 bg-slate-950/80 px-3.5 py-2.5 text-base text-slate-100 focus:border-primary-400/60 focus:outline-none focus:ring-4 focus:ring-primary-500/20 sm:text-sm"
              >
                {video.qualities.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label}
                    {formatFileSize(q.size) ? ` · ${formatFileSize(q.size)}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onDownload}
              disabled={downloading || !qualityId}
              className={`${btnClass} w-full shrink-0 bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-base text-white shadow-lg shadow-primary-900/25 hover:brightness-110 lg:min-h-11 lg:w-auto lg:min-w-[11.5rem]`}
            >
              {downloading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Download className="h-5 w-5" aria-hidden />
              )}
              <span>{downloading ? t("downloading") : t("button_download")}</span>
            </button>
          </div>
        )}

        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500 sm:text-left">
          {t("download_note")}
        </p>
      </div>
    </article>
  )
}

export default function VideoDownloader({
  variant = "default",
  autoFocus = false,
}: VideoDownloaderProps) {
  const t = useTranslations("VideoDownloader")
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [errorKey, setErrorKey] = useState<ApiErrorCode | null>(null)
  const [video, setVideo] = useState<VideoPreview | null>(null)
  const [qualityId, setQualityId] = useState("")

  useEffect(() => {
    if (!autoFocus) return
    const mq = window.matchMedia("(min-width: 640px)")
    if (mq.matches) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  const fetchVideo = useCallback(async () => {
    setErrorKey(null)
    setVideo(null)
    setLoading(true)

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErrorKey(mapApiError(data.error))
        return
      }

      const defaultQ = data.defaultQualityId ?? data.qualities?.[0]?.id ?? ""
      setQualityId(defaultQ)
      setVideo({
        videoId: data.videoId,
        title: data.title,
        thumbnail: data.thumbnail,
        author: data.author,
        durationSeconds: data.durationSeconds,
        qualities: data.qualities ?? [],
        defaultQualityId: defaultQ,
      })
    } catch {
      setErrorKey("fetch_failed")
    } finally {
      setLoading(false)
    }
  }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || loading) return
    void fetchVideo()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.trim()) {
        setUrl(text.trim())
        inputRef.current?.focus()
      }
    } catch {
      inputRef.current?.focus()
    }
  }

  const handleDownload = () => {
    if (!video || !qualityId) return
    setDownloading(true)
    window.location.assign(downloadHref(video.videoId, qualityId))
    window.setTimeout(() => setDownloading(false), 3000)
  }

  const isHero = variant === "hero"
  const shellClass = isHero
    ? "w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6"
    : "mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8"

  const errorMessage =
    errorKey === "api_not_configured"
      ? t("error_api_not_configured")
      : errorKey === "invalid_url"
        ? t("error_invalid_url")
        : errorKey
          ? t("error_fetch_failed")
          : null

  const showStatus = Boolean(loading || video || errorMessage)

  return (
    <div className={shellClass}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="video-url" className="sr-only">
          {t("input_label")}
        </label>

        <div className="flex flex-col gap-2.5 md:flex-row md:items-stretch md:gap-3">
          <div className="relative min-w-0 flex-1">
            <Link2
              className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              ref={inputRef}
              id="video-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              enterKeyHint="go"
              placeholder={t("input_placeholder")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 py-3 pl-10 pr-3 text-base text-slate-100 transition-[border-color,box-shadow] duration-200 placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none focus:ring-4 focus:ring-primary-500/20 md:min-h-12 md:py-3.5 md:pl-11 md:pr-4"
            />
          </div>

          <div className="flex flex-col gap-2 md:shrink-0 md:flex-row md:gap-2">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={`${BTN} order-1 w-full bg-gradient-to-r from-primary-600 to-primary-500 px-5 text-white shadow-lg shadow-primary-900/30 hover:brightness-110 md:order-2 md:min-w-[132px]`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden />
              )}
              <span>{loading ? t("loading") : t("button_fetch")}</span>
            </button>
            <button
              type="button"
              onClick={() => void handlePaste()}
              className={`${BTN} order-2 w-full border border-white/15 bg-slate-800/50 px-4 font-medium text-slate-200 hover:border-primary-400/40 hover:bg-slate-800 md:order-1 md:w-auto`}
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden />
              {t("button_paste")}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-xs leading-relaxed text-slate-500 md:text-left">
          {t("hint")}
        </p>
      </form>

      {isHero && (
        <ol className="mt-5 grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10 sm:pt-6">
          {(["step_1", "step_2", "step_3"] as const).map((key, i) => (
            <li
              key={key}
              className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:px-3 sm:text-center"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-[11px] font-bold text-primary-200">
                {i + 1}
              </span>
              <span className="text-xs leading-snug text-slate-400 sm:text-[13px]">{t(key)}</span>
            </li>
          ))}
        </ol>
      )}

      <div
        className={showStatus ? "mt-4 min-h-[4.5rem]" : ""}
        aria-live="polite"
        aria-busy={loading}
      >
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-3 text-sm text-orange-100"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" aria-hidden />
            <p>{errorMessage}</p>
          </div>
        )}

        {loading && !video && (
          <p className="flex items-center justify-center gap-2 py-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-primary-400" aria-hidden />
            {t("loading")}
          </p>
        )}

        {video ? (
          <VideoResultCard
            video={video}
            qualityId={qualityId}
            downloading={downloading}
            onQualityChange={setQualityId}
            onDownload={handleDownload}
            t={t}
            btnClass={BTN}
          />
        ) : null}
      </div>
    </div>
  )
}
