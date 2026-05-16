import type Innertube from "youtubei.js"
import { getInnertube } from "./client"
import {
  fetchRapidShortsDownload,
  fetchRapidVideoInfo,
  isRapidApiConfigured,
  pickDefaultQualityId,
  type RapidQualityOption,
} from "./rapid-downloader"

type VideoInfo = Awaited<ReturnType<Innertube["getBasicInfo"]>>

export type QualityOption = {
  id: string
  label: string
  size: number | null
}

export type ResolvedShorts = {
  videoId: string
  title: string
  thumbnail: string | null
  author: string | null
  durationSeconds: number | null
  qualityLabel: string | null
  mimeType: string | null
  contentLength: number | null
  qualities: QualityOption[]
  defaultQualityId: string | null
  provider: "rapidapi" | "innertube"
}

function pickThumbnail(info: VideoInfo): string | null {
  const thumbs = info.basic_info.thumbnail
  if (!thumbs?.length) return null
  return thumbs[thumbs.length - 1]?.url ?? thumbs[0]?.url ?? null
}

function mapRapidQualities(qualities: RapidQualityOption[]): QualityOption[] {
  return qualities.map((q) => ({
    id: q.id,
    label: q.label,
    size: q.size,
  }))
}

async function resolveViaRapid(videoId: string): Promise<ResolvedShorts> {
  const info = await fetchRapidVideoInfo(videoId)
  const defaultQualityId = pickDefaultQualityId(info.qualities)
  const defaultQuality =
    info.qualities.find((q) => q.id === defaultQualityId) ?? info.qualities[0] ?? null

  return {
    videoId,
    title: info.title,
    thumbnail: info.thumbnail,
    author: info.author,
    durationSeconds: info.durationSeconds,
    qualityLabel: defaultQuality?.label ?? null,
    mimeType: "video/mp4",
    contentLength: defaultQuality?.size ?? null,
    qualities: mapRapidQualities(info.qualities),
    defaultQualityId,
    provider: "rapidapi",
  }
}

async function resolveViaInnertube(videoId: string): Promise<ResolvedShorts> {
  const yt = await getInnertube()

  let info: VideoInfo
  try {
    info = await yt.getShortsVideoInfo(videoId)
  } catch {
    info = await yt.getBasicInfo(videoId)
  }

  if (info.playability_status?.status === "UNPLAYABLE") {
    throw new Error(info.playability_status.reason || "Video is not available for download")
  }

  const format = info.chooseFormat({ type: "video+audio", quality: "best", format: "mp4" })
  if (!format?.url) {
    throw new Error("No downloadable format found for this video")
  }

  const duration = info.basic_info.duration
  const label = format.quality_label ?? format.quality ?? null

  return {
    videoId,
    title: info.basic_info.title?.toString() || "YouTube Short",
    thumbnail: pickThumbnail(info),
    author: info.basic_info.author ?? null,
    durationSeconds: typeof duration === "number" ? duration : null,
    qualityLabel: label != null ? String(label) : null,
    mimeType: format.mime_type ?? "video/mp4",
    contentLength: format.content_length ?? null,
    qualities: label
      ? [{ id: "best", label: String(label), size: format.content_length ?? null }]
      : [],
    defaultQualityId: "best",
    provider: "innertube",
  }
}

export async function resolveShortsVideo(videoId: string): Promise<ResolvedShorts> {
  if (isRapidApiConfigured()) {
    try {
      return await resolveViaRapid(videoId)
    } catch (error) {
      const message = error instanceof Error ? error.message : "RapidAPI failed"
      console.warn("[resolve-shorts] RapidAPI failed, using innertube fallback:", message)
    }
  }
  return resolveViaInnertube(videoId)
}

export async function getDownloadStreamUrl(
  videoId: string,
  qualityId?: string | null
): Promise<{
  url: string
  mimeType: string
  title: string
  provider: "rapidapi" | "innertube"
}> {
  if (isRapidApiConfigured()) {
    try {
      const resolved = await resolveViaRapid(videoId)
      const qid = qualityId || resolved.defaultQualityId
      if (!qid) throw new Error("No quality selected")

      const link = await fetchRapidShortsDownload(videoId, qid)
      return {
        url: link.url,
        mimeType: link.mimeType,
        title: resolved.title,
        provider: "rapidapi",
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "RapidAPI download failed"
      console.warn("[resolve-shorts] RapidAPI download failed, using innertube:", message)
    }
  }

  const yt = await getInnertube()
  let info: VideoInfo
  try {
    info = await yt.getShortsVideoInfo(videoId)
  } catch {
    info = await yt.getBasicInfo(videoId)
  }

  const format = info.chooseFormat({ type: "video+audio", quality: "best", format: "mp4" })
  if (!format?.url) {
    throw new Error("No downloadable format found")
  }

  return {
    url: format.url,
    mimeType: format.mime_type ?? "video/mp4",
    title: info.basic_info.title?.toString() || "youtube-short",
    provider: "innertube",
  }
}
