/**
 * youtube-video-fast-downloader-24-7 (RapidAPI)
 * Same API surface as MCP server `youtube-video-fast-downloader-24-7`.
 */

const RAPIDAPI_HOST =
  process.env.RAPIDAPI_YOUTUBE_HOST ?? "youtube-video-fast-downloader-24-7.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

export type RapidQualityOption = {
  id: string
  type: "video" | "audio"
  label: string
  bitrate: number | null
  size: number | null
  mime: string | null
}

export type RapidVideoInfo = {
  videoId: string
  title: string
  author: string | null
  thumbnail: string | null
  durationSeconds: number | null
  qualities: RapidQualityOption[]
}

export type RapidDownloadLink = {
  url: string
  fallbackUrl: string | null
  qualityId: string
  mimeType: string
  size: number | null
  preparingNote: string | null
}

type RawThumbnail = { url?: string; width?: number; height?: number }
type RawQuality = {
  id?: string | number
  type?: string
  quality?: string
  bitrate?: string | number
  size?: number
  mime?: string
}

type RawVideoInfo = {
  title?: string
  author?: string
  ownerChannelName?: string
  lengthSeconds?: string | number
  thumbnail?: RawThumbnail[]
  availableQuality?: RawQuality[]
}

type RawDownloadResponse = {
  file?: string
  reserved_file?: string
  quality?: string | number
  mime?: string
  size?: number
  comment?: string
}

export function isRapidApiConfigured(): boolean {
  return Boolean(RAPIDAPI_KEY?.trim())
}

function rapidHeaders(): HeadersInit {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not configured")
  }
  return {
    "x-rapidapi-host": RAPIDAPI_HOST,
    "x-rapidapi-key": RAPIDAPI_KEY,
  }
}

async function rapidFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
    ...init,
    headers: { ...rapidHeaders(), ...init?.headers },
    cache: "no-store",
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : text || res.statusText
    throw new Error(message || `RapidAPI request failed (${res.status})`)
  }

  return data as T
}

function pickThumbnail(thumbnails: RawThumbnail[] | undefined): string | null {
  if (!thumbnails?.length) return null
  const sorted = [...thumbnails].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  return sorted[0]?.url ?? thumbnails[thumbnails.length - 1]?.url ?? null
}

const RESOLUTION_ORDER: Record<string, number> = {
  "1080p": 5,
  "720p": 4,
  "480p": 3,
  "360p": 2,
  "240p": 1,
  "144p": 0,
  Unknown: -1,
}

function parseQualities(raw: RawQuality[] | undefined): RapidQualityOption[] {
  if (!raw?.length) return []

  const videoOnly = raw.filter((q) => q.type === "video" && q.id != null && q.id !== 0)
  const byLabel = new Map<string, RapidQualityOption>()

  for (const q of videoOnly) {
    const id = String(q.id)
    const label = q.quality && q.quality !== "Unknown" ? q.quality : id
    const existing = byLabel.get(label)
    const size = typeof q.size === "number" ? q.size : null
    const candidate: RapidQualityOption = {
      id,
      type: "video",
      label,
      bitrate: typeof q.bitrate === "number" ? q.bitrate : Number(q.bitrate) || null,
      size,
      mime: q.mime ?? null,
    }

    if (!existing || (candidate.size ?? 0) > (existing.size ?? 0)) {
      byLabel.set(label, candidate)
    }
  }

  return [...byLabel.values()].sort(
    (a, b) => (RESOLUTION_ORDER[b.label] ?? -1) - (RESOLUTION_ORDER[a.label] ?? -1)
  )
}

export function pickDefaultQualityId(qualities: RapidQualityOption[]): string | null {
  if (!qualities.length) return null
  const preferred = qualities.find((q) => q.label === "720p") ?? qualities[0]
  return preferred.id
}

export async function fetchRapidVideoInfo(videoId: string): Promise<RapidVideoInfo> {
  const data = await rapidFetch<RawVideoInfo>(
    `/get-video-info/${encodeURIComponent(videoId)}?return_available_quality=true`
  )

  const durationRaw = data.lengthSeconds
  const durationSeconds =
    durationRaw != null && durationRaw !== "" ? Number(durationRaw) || null : null

  const qualities = parseQualities(data.availableQuality)
  const defaultId = pickDefaultQualityId(qualities)

  return {
    videoId,
    title: data.title?.trim() || "YouTube Short",
    author: data.author ?? data.ownerChannelName ?? null,
    thumbnail: pickThumbnail(data.thumbnail),
    durationSeconds,
    qualities: qualities.length
      ? qualities
      : defaultId
        ? [{ id: defaultId, type: "video", label: "720p", bitrate: null, size: null, mime: null }]
        : [],
  }
}

export async function fetchRapidShortsDownload(
  videoId: string,
  qualityId: string
): Promise<RapidDownloadLink> {
  const data = await rapidFetch<RawDownloadResponse>(
    `/download_short/${encodeURIComponent(videoId)}?quality=${encodeURIComponent(qualityId)}`
  )

  const url = data.file?.trim()
  if (!url) {
    throw new Error("No download URL returned from API")
  }

  return {
    url,
    fallbackUrl: data.reserved_file?.trim() || null,
    qualityId: String(data.quality ?? qualityId),
    mimeType: (data.mime ?? "video/mp4").replace(/\\\//g, "/"),
    size: typeof data.size === "number" ? data.size : null,
    preparingNote: data.comment ?? null,
  }
}

export async function waitForDownloadFile(
  link: RapidDownloadLink,
  options?: { maxAttempts?: number; intervalMs?: number }
): Promise<string> {
  const maxAttempts = options?.maxAttempts ?? 15
  const intervalMs = options?.intervalMs ?? 2000
  const urls = [link.url, link.fallbackUrl].filter(Boolean) as string[]

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (const url of urls) {
      try {
        const head = await fetch(url, { method: "HEAD", cache: "no-store" })
        if (head.ok) return url
      } catch {
        /* try next url */
      }
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, intervalMs))
    }
  }

  return link.url
}
