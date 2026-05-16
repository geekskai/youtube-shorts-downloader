import { NextResponse } from "next/server"
import { z } from "zod"
import { parseYouTubeVideoId } from "@/lib/youtube/parse-url"
import { resolveShortsVideo } from "@/lib/youtube/resolve-shorts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z.object({
  url: z.string().min(1).max(2048),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { url } = bodySchema.parse(json)
    const videoId = parseYouTubeVideoId(url)

    if (!videoId) {
      return NextResponse.json({ error: "invalid_url" }, { status: 400 })
    }

    const video = await resolveShortsVideo(videoId)
    const defaultQuality = video.defaultQualityId ?? video.qualities[0]?.id ?? "best"

    return NextResponse.json({
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      author: video.author,
      durationSeconds: video.durationSeconds,
      qualityLabel: video.qualityLabel,
      qualities: video.qualities,
      defaultQualityId: defaultQuality,
      provider: video.provider,
      downloadUrl: `/api/shorts/download?videoId=${encodeURIComponent(videoId)}&quality=${encodeURIComponent(defaultQuality)}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch_failed"
    console.error("[api/shorts]", message)
    return NextResponse.json({ error: "fetch_failed", message }, { status: 502 })
  }
}
