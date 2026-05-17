/**
 * youtube-video-fast-downloader-24-7 (RapidAPI)
 * Same endpoints as MCP: Get_Video_Details_and_Quality, Get_Shorts_Download_URL
 */

const HOST =
  process.env.RAPIDAPI_YOUTUBE_HOST ?? "youtube-video-fast-downloader-24-7.p.rapidapi.com"

export type QualityOption = {
  id: string
  label: string
  size: number | null
}

export type VideoInfo = {
  videoId: string
  title: string
  author: string | null
  thumbnail: string | null
  durationSeconds: number | null
  qualities: QualityOption[]
  defaultQualityId: string
}

export type DownloadLink = {
  url: string
  fallbackUrl: string | null
  mimeType: string
}

export class ShortsApiError extends Error {
  constructor(
    message: string,
    readonly code: "not_configured" | "upstream" | "no_download_url"
  ) {
    super(message)
    this.name = "ShortsApiError"
  }
}

export function isApiConfigured(): boolean {
  return Boolean(process.env.RAPIDAPI_KEY?.trim())
}

function headers(): HeadersInit {
  const key = process.env.RAPIDAPI_KEY?.trim()
  if (!key) {
    throw new ShortsApiError("RAPIDAPI_KEY is not set in environment", "not_configured")
  }
  return {
    "x-rapidapi-host": HOST,
    "x-rapidapi-key": key,
  }
}

async function rapidGet<T>(path: string): Promise<T> {
  const res = await fetch(`https://${HOST}${path}`, {
    headers: headers(),
    cache: "no-store",
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    /* non-JSON */
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : text || res.statusText
    throw new ShortsApiError(message || `API error (${res.status})`, "upstream")
  }

  return data as T
}

type RawThumbnail = { url?: string; width?: number; height?: number }
type RawQuality = {
  id?: string | number
  type?: string
  quality?: string
  size?: number
}
type RawVideoInfo = {
  title?: string
  author?: string
  ownerChannelName?: string
  lengthSeconds?: string | number
  thumbnail?: RawThumbnail[]
  availableQuality?: RawQuality[]
}
type RawDownload = {
  file?: string
  reserved_file?: string
  mime?: string
}

const RES_ORDER: Record<string, number> = {
  "1080p": 5,
  "720p": 4,
  "480p": 3,
  "360p": 2,
  "240p": 1,
  "144p": 0,
}

function parseQualitiesByType(
  raw: RawQuality[] | undefined,
  mediaType: "video" | "audio"
): QualityOption[] {
  if (!raw?.length) return []

  const map = new Map<string, QualityOption>()
  for (const q of raw) {
    if (q.type !== mediaType || q.id == null || q.id === 0) continue
    const id = String(q.id)
    const label = q.quality && q.quality !== "Unknown" ? q.quality : id
    const size = typeof q.size === "number" ? q.size : null
    const prev = map.get(label)
    if (!prev || (size ?? 0) > (prev.size ?? 0)) {
      map.set(label, { id, label, size })
    }
  }

  if (mediaType === "video") {
    return [...map.values()].sort(
      (a, b) => (RES_ORDER[b.label] ?? -1) - (RES_ORDER[a.label] ?? -1)
    )
  }

  return [...map.values()].sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
}

function parseQualities(raw: RawQuality[] | undefined): QualityOption[] {
  return parseQualitiesByType(raw, "video")
}

function parseAudioQualities(raw: RawQuality[] | undefined): QualityOption[] {
  return parseQualitiesByType(raw, "audio")
}

function pickThumbnail(thumbs: RawThumbnail[] | undefined): string | null {
  if (!thumbs?.length) return null
  return [...thumbs].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url ?? null
}

function defaultQualityId(qualities: QualityOption[]): string {
  return qualities.find((q) => q.label === "720p")?.id ?? qualities[0]?.id ?? ""
}

function defaultAudioQualityId(qualities: QualityOption[]): string {
  if (!qualities.length) return ""
  return [...qualities].sort((a, b) => (b.size ?? 0) - (a.size ?? 0))[0]?.id ?? ""
}

/** MCP: Get_Video_Details_and_Quality */
export async function getVideoInfo(
  videoId: string,
  defaultTitle = "YouTube Video"
): Promise<VideoInfo> {
  const data = await rapidGet<RawVideoInfo>(
    `/get-video-info/${encodeURIComponent(videoId)}?return_available_quality=true`
  )

  const qualities = parseQualities(data.availableQuality)
  const defaultId = defaultQualityId(qualities)
  const durationRaw = data.lengthSeconds

  return {
    videoId,
    title: data.title?.trim() || defaultTitle,
    author: data.author ?? data.ownerChannelName ?? null,
    thumbnail: pickThumbnail(data.thumbnail),
    durationSeconds:
      durationRaw != null && durationRaw !== "" ? Number(durationRaw) || null : null,
    qualities,
    defaultQualityId: defaultId,
  }
}

/** MCP: Get_Video_Details_and_Quality (audio tracks only) */
export async function getAudioInfo(
  videoId: string,
  defaultTitle = "YouTube Audio"
): Promise<VideoInfo> {
  const data = await rapidGet<RawVideoInfo>(
    `/get-video-info/${encodeURIComponent(videoId)}?return_available_quality=true`
  )

  const qualities = parseAudioQualities(data.availableQuality)
  const defaultId = defaultAudioQualityId(qualities)
  const durationRaw = data.lengthSeconds

  return {
    videoId,
    title: data.title?.trim() || defaultTitle,
    author: data.author ?? data.ownerChannelName ?? null,
    thumbnail: pickThumbnail(data.thumbnail),
    durationSeconds:
      durationRaw != null && durationRaw !== "" ? Number(durationRaw) || null : null,
    qualities,
    defaultQualityId: defaultId,
  }
}

/** MCP: Get_Shorts_Download_URL */
export async function getShortsDownloadLink(
  videoId: string,
  qualityId: string
): Promise<DownloadLink> {
  const data = await rapidGet<RawDownload>(
    `/download_short/${encodeURIComponent(videoId)}?quality=${encodeURIComponent(qualityId)}`
  )

  const url = data.file?.trim()
  if (!url) {
    throw new ShortsApiError("No download URL returned", "no_download_url")
  }

  return {
    url,
    fallbackUrl: data.reserved_file?.trim() || null,
    mimeType: (data.mime ?? "video/mp4").replace(/\\\//g, "/"),
  }
}

/** @deprecated Use getShortsDownloadLink */
export const getDownloadLink = getShortsDownloadLink

/** MCP: Get_Video_Download_URL */
export async function getVideoDownloadLink(
  videoId: string,
  qualityId: string
): Promise<DownloadLink> {
  const data = await rapidGet<RawDownload>(
    `/download_video/${encodeURIComponent(videoId)}?quality=${encodeURIComponent(qualityId)}`
  )

  const url = data.file?.trim()
  if (!url) {
    throw new ShortsApiError("No download URL returned", "no_download_url")
  }

  return {
    url,
    fallbackUrl: data.reserved_file?.trim() || null,
    mimeType: (data.mime ?? "video/mp4").replace(/\\\//g, "/"),
  }
}

/** MCP: Get_Audio_Download_URL */
export async function getAudioDownloadLink(
  videoId: string,
  qualityId: string
): Promise<DownloadLink> {
  const data = await rapidGet<RawDownload>(
    `/download_audio/${encodeURIComponent(videoId)}?quality=${encodeURIComponent(qualityId)}`
  )

  const url = data.file?.trim()
  if (!url) {
    throw new ShortsApiError("No download URL returned", "no_download_url")
  }

  return {
    url,
    fallbackUrl: data.reserved_file?.trim() || null,
    mimeType: (data.mime ?? "audio/mp4").replace(/\\\//g, "/"),
  }
}

/** Poll CDN until HEAD succeeds (files are sometimes prepared async). */
export async function resolveReadyUrl(link: DownloadLink, maxAttempts = 8): Promise<string> {
  const urls = [link.url, link.fallbackUrl].filter(Boolean) as string[]

  for (let i = 0; i < maxAttempts; i++) {
    for (const url of urls) {
      try {
        const head = await fetch(url, { method: "HEAD", cache: "no-store" })
        if (head.ok) return url
      } catch {
        /* retry */
      }
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 1500))
    }
  }

  return link.url
}
