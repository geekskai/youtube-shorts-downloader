export type DownloaderApiErrorCode =
  | "invalid_url"
  | "metadata_api_not_configured"
  | "fetch_failed"

const MESSAGE_KEY_BY_ERROR: Record<DownloaderApiErrorCode, string> = {
  metadata_api_not_configured: "error_metadata_api_not_configured",
  invalid_url: "error_invalid_url",
  fetch_failed: "error_fetch_failed",
}

export function mapDownloaderApiError(code: string | undefined): DownloaderApiErrorCode {
  if (code === "invalid_url" || code === "invalid_body") return "invalid_url"
  if (code === "metadata_api_not_configured") return "metadata_api_not_configured"
  return "fetch_failed"
}

export function getDownloaderErrorMessage(
  t: (key: string) => string,
  errorCode: DownloaderApiErrorCode | null
) {
  if (!errorCode) return null
  return t(MESSAGE_KEY_BY_ERROR[errorCode])
}

export async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  return res.json().catch(() => ({}))
}

export type ClientVideoMetadata = {
  videoId: string
  title: string
  author: string | null
  thumbnail: string | null
  durationSeconds: number | null
}

type YouTubeDataResponse = {
  items?: Array<{
    id?: string
    snippet?: {
      title?: string
      channelTitle?: string
      thumbnails?: Record<string, { url?: string; width?: number; height?: number }>
    }
    contentDetails?: {
      duration?: string
    }
  }>
}

function parseIsoDuration(value: string | undefined): number | null {
  if (!value) return null
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value)
  if (!match) return null
  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match
  return (
    Number(days) * 86400 +
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds)
  )
}

function pickThumbnail(
  thumbnails: Record<string, { url?: string; width?: number; height?: number }> | undefined
): string | null {
  if (!thumbnails) return null
  const best = Object.values(thumbnails)
    .filter((item) => Boolean(item?.url))
    .sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0))[0]
  return best?.url ?? null
}

export function buildYouTubeThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export async function fetchYouTubeMetadataClient(
  videoId: string,
  defaultTitle: string
): Promise<ClientVideoMetadata> {
  const key = process.env.NEXT_PUBLIC_YOUTUBE_DATA_API_KEY?.trim()
  if (!key) {
    throw new Error("metadata_api_not_configured")
  }

  const query = new URLSearchParams({
    part: "snippet,contentDetails",
    id: videoId,
    key,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${query}`, {
    cache: "no-store",
  })
  const data = (await parseJsonSafe(res)) as YouTubeDataResponse

  if (!res.ok) {
    throw new Error("fetch_failed")
  }

  const item = data.items?.[0]
  return {
    videoId,
    title: item?.snippet?.title?.trim() || defaultTitle,
    author: item?.snippet?.channelTitle ?? null,
    thumbnail: pickThumbnail(item?.snippet?.thumbnails) || buildYouTubeThumbnailUrl(videoId),
    durationSeconds: parseIsoDuration(item?.contentDetails?.duration),
  }
}
