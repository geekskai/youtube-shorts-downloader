"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import axios from "axios"
import fileDownload from "js-file-download"
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
import {
  fetchYouTubeMetadataClient,
  getDownloaderErrorMessage,
  mapDownloaderApiError,
  type DownloaderApiErrorCode,
} from "@/components/downloader/shared"
import { parseYouTubeVideoId } from "@/lib/youtube/parse-url"

type VideoPreview = {
  videoId: string
  title: string
  thumbnail: string | null
  author: string | null
  durationSeconds: number | null
}

type ApiErrorCode = DownloaderApiErrorCode

function formatDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

type ShortsDownloaderProps = {
  variant?: "hero" | "default"
  autoFocus?: boolean
}

const BTN =
  "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold leading-none transition-[background-color,border-color,opacity] duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-45 md:min-h-12 md:text-sm"
const RAPIDAPI_HOST = "youtube-shorts-video-downloader-and-converter.p.rapidapi.com"
const DEFAULT_RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY?.trim() ?? ""
const DEFAULT_SHORTS_QUALITY = "360p"
const SHORTS_QUALITY_OPTIONS = ["144p", "240p", "360p", "480p", "720p", "1080p"] as const
const SHORTS_QUALITY_LABEL = SHORTS_QUALITY_OPTIONS.join(" / ")

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function sanitizeFileName(name: string): string {
  const normalized = name.trim().replace(/[\\/:*?"<>|]+/g, "_")
  if (!normalized) return "youtube-shorts-video"
  return normalized
}

type VideoResultCardProps = {
  video: VideoPreview
  t: ReturnType<typeof useTranslations<"ShortsDownloader">>
}

function VideoResultCard({ video, t }: VideoResultCardProps) {
  const duration = formatDuration(video.durationSeconds)

  return (
    <article className="overflow-hidden rounded-xl border border-primary-500/20 bg-gradient-to-br from-slate-950/90 via-slate-900/50 to-slate-950/90 md:rounded-2xl">
      <header className="border-b border-white/10 px-3.5 py-2 md:px-4 md:py-2.5 lg:px-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/35 bg-primary-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-100 md:px-3 md:text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("ready")}
        </span>
      </header>

      <div className="p-3.5 md:p-4 lg:p-5">
        {/* Preview row: thumb + meta (mobile & desktop) */}
        <div className="flex gap-3 md:gap-4 lg:gap-5">
          {video.thumbnail ? (
            <div className="relative h-[122px] w-[69px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black shadow-lg shadow-black/40 md:h-[150px] md:w-[84px] md:rounded-xl lg:h-[160px] lg:w-[90px]">
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="(max-width: 767px) 69px, (max-width: 1023px) 84px, 90px"
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
              className="flex h-[122px] w-[69px] shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900/80 md:h-[150px] md:w-[84px] md:rounded-xl lg:h-[160px] lg:w-[90px]"
              aria-hidden
            >
              <Download className="h-8 w-8 text-slate-600" />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
            <h3 className="line-clamp-3 text-[14px] font-semibold leading-5 text-slate-50 md:line-clamp-2 md:text-[15px] md:leading-snug lg:text-base">
              {video.title}
            </h3>
            {video.author && (
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-slate-400 md:text-sm">
                {video.author}
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 border-t border-white/10 pt-3 text-center text-xl leading-relaxed text-yellow-500 md:mt-4 md:pt-4 md:text-left md:text-xs">
          {t("download_note", { qualities: SHORTS_QUALITY_LABEL })}
        </p>
      </div>
    </article>
  )
}

type DownloadFeedbackProps = {
  loading: boolean
  downloading: boolean
  errorMessage: string | null
  downloadError: string | null
  downloadSuccess: string | null
  downloadProgress: number
  downloadLoadedBytes: number
  downloadTotalBytes: number | null
  t: ReturnType<typeof useTranslations<"ShortsDownloader">>
}

function DownloadFeedback({
  loading,
  downloading,
  errorMessage,
  downloadError,
  downloadSuccess,
  downloadProgress,
  downloadLoadedBytes,
  downloadTotalBytes,
  t,
}: DownloadFeedbackProps) {
  return (
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
          <Loader2 className="h-4 w-4 animate-spin text-primary-400" aria-hidden />
          {t("loading")}
        </p>
      ) : null}

      {downloading ? (
        <div className="mt-2 rounded-xl border border-primary-500/25 bg-primary-500/10 px-3 py-2.5 md:px-3.5 md:py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-300">
            <span>{t("download_progress_label")}</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 transition-[width] duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {downloadTotalBytes && downloadTotalBytes > 0
              ? t("download_progress_bytes", {
                  loaded: formatBytes(downloadLoadedBytes),
                  total: formatBytes(downloadTotalBytes),
                })
              : t("download_progress_bytes_unknown", {
                  loaded: formatBytes(downloadLoadedBytes),
                })}
          </p>
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
  )
}

export default function ShortsDownloader({
  variant = "default",
  autoFocus = false,
}: ShortsDownloaderProps) {
  const t = useTranslations("ShortsDownloader")
  const inputRef = useRef<HTMLInputElement>(null)
  const progressTimerRef = useRef<number | null>(null)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadLoadedBytes, setDownloadLoadedBytes] = useState(0)
  const [downloadTotalBytes, setDownloadTotalBytes] = useState<number | null>(null)
  const [quality, setQuality] = useState<string>(DEFAULT_SHORTS_QUALITY)
  const [errorKey, setErrorKey] = useState<ApiErrorCode | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoPreview | null>(null)

  useEffect(() => {
    if (!autoFocus) return
    const mq = window.matchMedia("(min-width: 640px)")
    if (mq.matches) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  const stopProgressSimulation = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }, [])

  const startProgressSimulation = useCallback(() => {
    stopProgressSimulation()
    progressTimerRef.current = window.setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 99) return 99
        if (prev < 25) return Math.min(prev + 4, 99)
        if (prev < 55) return Math.min(prev + 2, 99)
        if (prev < 85) return Math.min(prev + 1, 99)
        return Math.min(prev + (Math.random() < 0.32 ? 1 : 0), 99)
      })
    }, 180)
  }, [stopProgressSimulation])

  const resetDownloadState = useCallback(() => {
    stopProgressSimulation()
    setDownloadError(null)
    setDownloadSuccess(null)
    setDownloadProgress(0)
    setDownloadLoadedBytes(0)
    setDownloadTotalBytes(null)
  }, [stopProgressSimulation])

  const resetPreviewState = useCallback(() => {
    setVideo(null)
    setErrorKey(null)
    resetDownloadState()
  }, [resetDownloadState])

  const fetchVideo = useCallback(async () => {
    setErrorKey(null)
    resetDownloadState()
    setVideo(null)
    setLoading(true)

    try {
      const videoId = parseYouTubeVideoId(url.trim())
      if (!videoId) {
        setErrorKey("invalid_url")
        return
      }

      const metadata = await fetchYouTubeMetadataClient(videoId, "YouTube Short")
      setVideo({
        videoId: metadata.videoId,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        author: metadata.author,
        durationSeconds: metadata.durationSeconds,
      })
    } catch (error) {
      setErrorKey(mapDownloaderApiError(error instanceof Error ? error.message : undefined))
    } finally {
      setLoading(false)
    }
  }, [resetDownloadState, url])

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
        resetPreviewState()
        inputRef.current?.focus()
      }
    } catch {
      inputRef.current?.focus()
    }
  }

  const handleDownload = async () => {
    const selectedVideo = video
    if (!selectedVideo || downloading) return
    if (!DEFAULT_RAPIDAPI_KEY.trim()) {
      setDownloadError(t("error_missing_rapidapi_key"))
      return
    }

    setDownloadError(null)
    setDownloadSuccess(null)
    setDownloading(true)
    setDownloadProgress(6)
    setDownloadLoadedBytes(0)
    setDownloadTotalBytes(null)
    startProgressSimulation()

    const requestUrl = `https://${RAPIDAPI_HOST}/download-short-mp4/${selectedVideo.videoId}?quality=${quality}`

    try {
      const response = await axios({
        url: requestUrl,
        method: "GET",
        responseType: "blob",
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": DEFAULT_RAPIDAPI_KEY.trim(),
        },
        onDownloadProgress: (progressEvent) => {
          setDownloadLoadedBytes(progressEvent.loaded)
          const total = progressEvent.total
          if (typeof total === "number" && Number.isFinite(total) && total > 0) {
            setDownloadTotalBytes(total)
            const actualPct = Math.round((progressEvent.loaded / total) * 100)
            if (actualPct >= 100 || progressEvent.loaded >= total) return
            setDownloadProgress((prev) => {
              const guidedPct = actualPct < 25 ? actualPct + 8 : actualPct + 4
              return Math.min(99, Math.max(prev, guidedPct, 12))
            })
            return
          }

          if (typeof progressEvent.progress === "number") {
            const actualPct = Math.round(progressEvent.progress * 100)
            if (actualPct >= 100) return
            setDownloadProgress((prev) => Math.min(99, Math.max(prev, actualPct + 4, 12)))
          }
        },
      })
      const contentType = String(response.headers["content-type"] || "")
      if (!contentType.includes("octet-stream") && !contentType.includes("video")) {
        const maybeText = await response.data.text()
        throw new Error(maybeText?.slice(0, 200) || "Invalid media response")
      }
      const blob = response.data
      const fileName = `${sanitizeFileName(selectedVideo.title)}.mp4`

      stopProgressSimulation()
      setDownloadProgress(100)
      setDownloadLoadedBytes(blob.size)
      setDownloadTotalBytes((current) => current ?? blob.size)
      fileDownload(blob, fileName)

      setDownloadSuccess(
        t("download_success", {
          filename: fileName,
          size: formatBytes(blob.size),
        })
      )
      setVideo(null)
    } catch (error) {
      setDownloadProgress(0)
      setDownloadLoadedBytes(0)
      setDownloadTotalBytes(null)
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.statusText ||
          error.message ||
          t("error_download_failed")
        : error instanceof Error
          ? error.message
          : t("error_download_failed")
      setDownloadError(`${t("error_download_failed")} (${message})`)
    } finally {
      stopProgressSimulation()
      setDownloading(false)
    }
  }

  useEffect(() => () => stopProgressSimulation(), [stopProgressSimulation])

  const isHero = variant === "hero"
  const shellClass = isHero
    ? "w-full rounded-xl border border-white/10 bg-slate-900/50 p-3.5 backdrop-blur-sm md:rounded-2xl md:p-5 lg:p-6"
    : "mx-auto w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900/50 p-3.5 backdrop-blur-sm md:max-w-3xl md:rounded-2xl md:p-6 lg:max-w-4xl lg:p-8"

  const errorMessage = getDownloaderErrorMessage(t, errorKey)
  const canDownload = Boolean(video)

  return (
    <div className={shellClass}>
      <DownloadFeedback
        loading={loading}
        downloading={downloading}
        errorMessage={errorMessage}
        downloadError={downloadError}
        downloadSuccess={downloadSuccess}
        downloadProgress={downloadProgress}
        downloadLoadedBytes={downloadLoadedBytes}
        downloadTotalBytes={downloadTotalBytes}
        t={t}
      />

      {video ? (
        <div className="mb-3.5 md:mb-4">
          <VideoResultCard video={video} t={t} />
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <label htmlFor="shorts-url" className="sr-only">
          {t("input_label")}
        </label>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(0,1fr)_150px_auto] md:items-stretch md:gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto] lg:gap-4">
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
              onChange={(e) => {
                setUrl(e.target.value)
                resetPreviewState()
              }}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 py-3 pl-10 pr-3 text-[15px] leading-6 text-slate-100 transition-[border-color,box-shadow] duration-200 placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none focus:ring-4 focus:ring-primary-500/20 md:min-h-12 md:py-3.5 md:pl-11 md:pr-4 md:text-base"
            />
          </div>

          <div className="relative min-w-0">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 py-3 pl-3 pr-3 text-[14px] text-slate-100 transition-[border-color,box-shadow] duration-200 focus:border-primary-400/60 focus:outline-none focus:ring-4 focus:ring-primary-500/20 md:min-h-12 md:py-3.5 md:text-sm"
            >
              {SHORTS_QUALITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:shrink-0 md:flex-row md:items-stretch md:gap-2">
            {canDownload ? (
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloading}
                className={`${BTN} order-1 w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-900/30 hover:brightness-110 md:order-2 md:min-w-[136px] lg:min-w-[148px]`}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                <span>{downloading ? t("downloading") : t("button_download")}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className={`${BTN} order-1 w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-900/30 hover:brightness-110 md:order-2 md:min-w-[136px] lg:min-w-[148px]`}
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
              className={`${BTN} order-2 w-full border border-white/15 bg-slate-800/50 font-medium text-slate-200 hover:border-primary-400/40 hover:bg-slate-800 md:order-1 md:w-auto`}
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden />
              {t("button_paste")}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500 md:mt-2.5 md:text-left md:text-xs">
          {t("hint", { qualities: SHORTS_QUALITY_LABEL })}
        </p>
      </form>

      {isHero && (
        <ol className="mt-5 grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10 sm:pt-6 md:mt-6 lg:mt-7">
          {(["step_1", "step_2", "step_3"] as const).map((key, i) => (
            <li
              key={key}
              className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:px-3 sm:text-center"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-[11px] font-bold text-primary-200">
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
