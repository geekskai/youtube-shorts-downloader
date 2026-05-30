"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Download,
  Music2,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  ArrowRight,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import {
  downloadFileWithProgress,
  isAudioContentType,
} from "@/components/downloader/downloadFileWithProgress"
import {
  fetchYouTubeMetadataClient,
  formatBytes,
  getDownloaderErrorMessage,
  mapDownloaderApiError,
  sanitizeFileName,
  type DownloaderApiErrorCode,
} from "@/components/downloader/shared"
import { useDownloadRetryCooldown } from "@/components/downloader/useDownloadRetryCooldown"
import { fetchMp3DownloadUrl, Mp3ClientError } from "@/app/[locale]/youtube-to-mp3/mp3-download"
import { parseYouTubeUrl } from "@/utils/parse-url"

type VideoPreview = {
  videoId: string
  title: string
  thumbnail: string | null
  author: string | null
  durationSeconds: number | null
  watchUrl: string
}

type ApiErrorCode = DownloaderApiErrorCode | "mp3_api_not_configured"

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

function watchUrlFromVideoId(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/** Map axios byte progress (0–99) into UI range after URL resolve (8–100). */
function mapDownloadProgress(axiosPercent: number): number {
  return Math.max(8, Math.min(100, Math.round(8 + axiosPercent * 0.92)))
}

type Mp3DownloaderProps = {
  variant?: "hero" | "default"
  autoFocus?: boolean
}

const BTN =
  "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold leading-none transition-[background-color,border-color,opacity] duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-45 md:min-h-12 md:text-sm"

type Mp3DownloaderT = ReturnType<typeof useTranslations<"Mp3Downloader">>

type VideoResultCardProps = {
  video: VideoPreview
  t: Mp3DownloaderT
}

function VideoResultCard({ video, t }: VideoResultCardProps) {
  const duration = formatDuration(video.durationSeconds)

  return (
    <article className="overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-slate-950/90 via-slate-900/50 to-slate-950/90 md:rounded-2xl">
      <header className="border-b border-white/10 px-3.5 py-2 md:px-4 md:py-2.5 lg:px-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100 md:px-3 md:text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("ready")}
        </span>
      </header>

      <div className="p-3.5 md:p-4 lg:p-5">
        <div className="flex gap-3 md:gap-4 lg:gap-5">
          {video.thumbnail ? (
            <div className="relative h-[72px] w-[128px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black shadow-lg shadow-black/40 md:h-[84px] md:w-[150px] md:rounded-xl lg:h-[90px] lg:w-[160px]">
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="(max-width: 767px) 128px, (max-width: 1023px) 150px, 160px"
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
              className="flex h-[72px] w-[128px] shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900/80 md:h-[84px] md:w-[150px] md:rounded-xl lg:h-[90px] lg:w-[160px]"
              aria-hidden
            >
              <Music2 className="h-8 w-8 text-slate-600" />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
            <h3 className="line-clamp-3 text-base font-semibold leading-5 text-slate-50 md:line-clamp-2 md:text-lg md:leading-snug lg:text-xl">
              {video.title}
            </h3>
            {video.author && (
              <p className="mt-1 line-clamp-2 text-base leading-5 text-slate-400 md:text-lg">
                {video.author}
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 border-t border-white/10 pt-3 text-center text-xs leading-relaxed text-amber-200/90 md:mt-4 md:pt-4 md:text-left md:text-sm">
          {t("download_note")}
        </p>
      </div>
    </article>
  )
}

export default function Mp3Downloader({
  variant = "default",
  autoFocus = false,
}: Mp3DownloaderProps) {
  const t = useTranslations("Mp3Downloader")
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const initializedFromQuery = useRef(false)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [errorKey, setErrorKey] = useState<ApiErrorCode | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoPreview | null>(null)
  const { isDownloadCooldown, cooldownSecondsLeft, startCooldown, clearCooldown } =
    useDownloadRetryCooldown()

  useEffect(() => {
    if (!autoFocus) return
    const mq = window.matchMedia("(min-width: 640px)")
    if (mq.matches) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  const resetDownloadState = useCallback(() => {
    setDownloadError(null)
    setDownloadSuccess(null)
    setDownloadProgress(0)
  }, [])

  const resetPreviewState = useCallback(() => {
    setVideo(null)
    setErrorKey(null)
    resetDownloadState()
    clearCooldown()
  }, [clearCooldown, resetDownloadState])

  const fetchVideo = useCallback(
    async (inputUrl?: string) => {
      const trimmed = (inputUrl ?? url).trim()
      setErrorKey(null)
      resetDownloadState()
      setVideo(null)

      const parsed = parseYouTubeUrl(trimmed)
      if (!parsed || (parsed.kind !== "video" && parsed.kind !== "shorts")) {
        setErrorKey("invalid_url")
        return
      }

      setLoading(true)

      try {
        const videoId = parsed.videoId
        const metadata = await fetchYouTubeMetadataClient(videoId, "YouTube MP3")
        setVideo({
          videoId: metadata.videoId,
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          author: metadata.author,
          durationSeconds: metadata.durationSeconds,
          watchUrl: trimmed.includes("youtube") ? trimmed : watchUrlFromVideoId(videoId),
        })
      } catch (error) {
        setErrorKey(mapDownloaderApiError(error instanceof Error ? error.message : undefined))
      } finally {
        setLoading(false)
      }
    },
    [resetDownloadState, url]
  )

  useEffect(() => {
    if (initializedFromQuery.current) return
    const incoming = searchParams.get("url")?.trim()
    if (!incoming) return
    const parsed = parseYouTubeUrl(incoming)
    if (!parsed || (parsed.kind !== "video" && parsed.kind !== "shorts")) return
    initializedFromQuery.current = true
    setUrl(incoming)
    void fetchVideo(incoming)
  }, [fetchVideo, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || loading) return
    void fetchVideo(url.trim())
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const trimmed = text.trim()
      if (!trimmed) return
      setUrl(trimmed)
      resetPreviewState()
      inputRef.current?.focus()
    } catch {
      inputRef.current?.focus()
    }
  }

  const handleDownload = async () => {
    const selectedVideo = video
    if (!selectedVideo || downloading || isDownloadCooldown) return

    setDownloadError(null)
    setDownloadSuccess(null)
    setDownloading(true)
    setDownloadProgress(2)

    try {
      const fileUrl = await fetchMp3DownloadUrl(selectedVideo.watchUrl)
      setDownloadProgress(8)

      const fileName = `${sanitizeFileName(selectedVideo.title, "youtube-audio")}.mp3`
      const { size } = await downloadFileWithProgress({
        url: fileUrl,
        fileName,
        onProgress: (axiosPercent) => setDownloadProgress(mapDownloadProgress(axiosPercent)),
        isValidContentType: isAudioContentType,
      })

      setDownloadSuccess(
        t("download_success", {
          filename: fileName,
          size: formatBytes(size),
        })
      )
      setVideo(null)
    } catch (error) {
      setDownloadProgress(0)
      const message =
        error instanceof Mp3ClientError && error.code === "not_configured"
          ? t("error_mp3_api_not_configured")
          : error instanceof Error
            ? error.message
            : t("error_download_failed")
      setDownloadError(`${t("error_download_failed")} (${message})`)
      startCooldown()
    } finally {
      setDownloading(false)
    }
  }

  const getErrorMessage = (code: ApiErrorCode | null) => {
    if (!code) return null
    if (code === "mp3_api_not_configured") return t("error_mp3_api_not_configured")
    return getDownloaderErrorMessage(t, code)
  }

  const isHero = variant === "hero"
  const shellClass = isHero
    ? "w-full rounded-xl border border-white/10 bg-slate-900/50 p-3.5 backdrop-blur-sm md:rounded-2xl md:p-5 lg:p-6"
    : "mx-auto w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900/50 p-3.5 backdrop-blur-sm md:max-w-3xl md:rounded-2xl md:p-6 lg:max-w-4xl lg:p-8"

  const errorMessage = getErrorMessage(errorKey)
  const canDownload = Boolean(video)
  const downloadButtonLabel = downloading
    ? t("downloading")
    : isDownloadCooldown
      ? t("download_cooldown", { seconds: cooldownSecondsLeft })
      : t("button_download")

  return (
    <div className={shellClass}>
      {video ? (
        <div className="mb-2 md:mb-4">
          <VideoResultCard video={video} t={t} />
        </div>
      ) : null}

      <div className="mb-3.5 md:mb-4" aria-live="polite" aria-busy={loading || downloading}>
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2.5 text-[13px] leading-5 text-orange-100 md:px-3.5 md:py-3 md:text-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" aria-hidden />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        {loading ? (
          <p className="flex items-center justify-center gap-2 py-2 text-[13px] text-slate-400 md:text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" aria-hidden />
            {t("loading")}
          </p>
        ) : null}

        {downloading ? (
          <div className="mt-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 md:px-3.5 md:py-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-300">
              <span>{t("download_progress_label")}</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-[width] duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {downloadError ? (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-[13px] leading-5 text-rose-100 md:px-3.5 md:py-3 md:text-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden />
            <p>{downloadError}</p>
          </div>
        ) : null}

        {downloadSuccess ? (
          <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2.5 text-[13px] leading-5 text-emerald-100 md:px-3.5 md:py-3 md:text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
            <p>{downloadSuccess}</p>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="mp3-url" className="sr-only">
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
              id="mp3-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              enterKeyHint="go"
              placeholder={t("input_placeholder")}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                resetPreviewState()
              }}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 py-3 pl-10 pr-3 text-[15px] leading-6 text-slate-100 transition-[border-color,box-shadow] duration-200 placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none focus:ring-4 focus:ring-amber-500/20 md:min-h-12 md:py-3.5 md:pl-11 md:pr-4 md:text-base"
            />
          </div>

          <div className="flex flex-col gap-2 md:shrink-0 md:flex-row md:items-stretch md:gap-2">
            {canDownload ? (
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloading || isDownloadCooldown}
                className={`${BTN} order-1 w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/30 hover:brightness-110 md:order-2 md:min-w-[136px] lg:min-w-[148px]`}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                <span>{downloadButtonLabel}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className={`${BTN} order-1 w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-900/30 hover:brightness-110 md:order-2 md:min-w-[136px] lg:min-w-[148px]`}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden />
                )}
                <span>{loading ? t("loading") : t("button_fetch")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => void handlePaste()}
              className={`${BTN} order-2 w-full border border-white/15 bg-slate-800/50 font-medium text-slate-200 hover:border-amber-400/40 hover:bg-slate-800 md:order-1 md:w-auto`}
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden />
              {t("button_paste")}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-sm leading-relaxed text-amber-300/90 md:mt-2.5 md:text-left md:text-base">
          {t("hint")}
        </p>
      </form>

      {isHero && (
        <ol className="mt-5 grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10 sm:pt-6 md:mt-6 lg:mt-7">
          {(["step_1", "step_2", "step_3"] as const).map((key, i) => (
            <li
              key={key}
              className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:px-3 sm:text-center"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-200">
                {i + 1}
              </span>
              <span className="text-xs leading-snug text-slate-400 sm:text-[13px] md:text-sm">
                {t(key)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
