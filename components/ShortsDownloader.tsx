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

type QualityOption = {
  id: string
  label: string
  size: number | null
}

type VideoPreview = {
  videoId: string
  title: string
  thumbnail: string | null
  author: string | null
  durationSeconds: number | null
  qualityLabel: string | null
  qualities: QualityOption[]
  defaultQualityId: string
  downloadUrl: string
}

function formatDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number | null): string | null {
  if (bytes == null || bytes <= 0) return null
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

function buildDownloadUrl(videoId: string, qualityId: string): string {
  return `/api/shorts/download?videoId=${encodeURIComponent(videoId)}&quality=${encodeURIComponent(qualityId)}`
}

type ShortsDownloaderProps = {
  variant?: "hero" | "default"
  autoFocus?: boolean
}

const BTN =
  "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-[background-color,border-color,opacity] duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-45"

export default function ShortsDownloader({
  variant = "default",
  autoFocus = false,
}: ShortsDownloaderProps) {
  const t = useTranslations("ShortsDownloader")
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoPreview | null>(null)
  const [selectedQuality, setSelectedQuality] = useState<string>("")

  useEffect(() => {
    if (!autoFocus) return
    const mq = window.matchMedia("(min-width: 640px)")
    if (mq.matches) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [autoFocus])

  const fetchVideo = useCallback(async () => {
    setErrorKey(null)
    setVideo(null)
    setLoading(true)

    try {
      const res = await fetch("/api/shorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorKey(data.error === "invalid_url" ? "error_invalid_url" : "error_fetch_failed")
        return
      }

      const defaultQ = data.defaultQualityId ?? data.qualities?.[0]?.id ?? "best"
      setSelectedQuality(defaultQ)
      setVideo({
        videoId: data.videoId,
        title: data.title,
        thumbnail: data.thumbnail,
        author: data.author,
        durationSeconds: data.durationSeconds,
        qualityLabel: data.qualityLabel,
        qualities: data.qualities ?? [],
        defaultQualityId: defaultQ,
        downloadUrl: buildDownloadUrl(data.videoId, defaultQ),
      })
    } catch {
      setErrorKey("error_fetch_failed")
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

  const handleQualityChange = (qualityId: string) => {
    setSelectedQuality(qualityId)
    if (video) {
      setVideo({
        ...video,
        downloadUrl: buildDownloadUrl(video.videoId, qualityId),
        qualityLabel: video.qualities.find((q) => q.id === qualityId)?.label ?? video.qualityLabel,
      })
    }
  }

  const handleDownload = () => {
    if (!video?.downloadUrl) return
    setDownloading(true)
    const anchor = document.createElement("a")
    anchor.href = video.downloadUrl
    anchor.download = ""
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => setDownloading(false), 1500)
  }

  const isHero = variant === "hero"
  const shellClass = isHero
    ? "w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6"
    : "mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8"

  const showStatus = Boolean(loading || video || errorKey)

  return (
    <div className={shellClass}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="shorts-url" className="sr-only">
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
              id="shorts-url"
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
        {errorKey && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-3 text-sm text-orange-100"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" aria-hidden />
            <p>{t(errorKey)}</p>
          </div>
        )}

        {loading && !video && (
          <p className="flex items-center justify-center gap-2 py-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-primary-400" aria-hidden />
            {t("loading")}
          </p>
        )}

        {video && (
          <article className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              {video.thumbnail && (
                <div className="relative mx-auto aspect-[9/16] w-[88px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:mx-0 sm:w-[100px]">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 88px, 100px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary-500/30 bg-primary-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-200">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  {t("ready")}
                </span>
                <h3 className="mt-2 line-clamp-2 text-base font-semibold text-slate-100">
                  {video.title}
                </h3>
                {video.author && <p className="mt-0.5 text-sm text-slate-400">{video.author}</p>}
                {formatDuration(video.durationSeconds) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDuration(video.durationSeconds)}
                  </p>
                )}

                {video.qualities.length > 1 && (
                  <div className="mt-3">
                    <label
                      htmlFor="quality-select"
                      className="mb-1 block text-xs font-medium text-slate-500"
                    >
                      {t("quality_label")}
                    </label>
                    <select
                      id="quality-select"
                      value={selectedQuality}
                      onChange={(e) => handleQualityChange(e.target.value)}
                      className="w-full min-h-11 touch-manipulation rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-base text-slate-100 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-500/25 sm:max-w-xs sm:text-sm"
                    >
                      {video.qualities.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.label}
                          {formatFileSize(q.size) ? ` · ${formatFileSize(q.size)}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`${BTN} mt-4 w-full bg-gradient-to-r from-primary-600 to-primary-500 py-3.5 text-white hover:brightness-110`}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              {downloading ? t("downloading") : t("button_download")}
            </button>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
              {t("download_note")}
            </p>
          </article>
        )}
      </div>
    </div>
  )
}
