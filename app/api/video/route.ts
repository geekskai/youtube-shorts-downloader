import { NextResponse } from "next/server"
import { z } from "zod"
import { getVideoInfo, isApiConfigured, ShortsApiError } from "@/lib/youtube/api"
import { parseYouTubeVideoId } from "@/lib/youtube/parse-url"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z.object({
  url: z.string().min(1).max(2048),
})

export async function POST(request: Request) {
  if (!isApiConfigured()) {
    return NextResponse.json(
      { error: "api_not_configured", message: "Set RAPIDAPI_KEY in .env.local" },
      { status: 503 }
    )
  }

  try {
    const { url } = bodySchema.parse(await request.json())
    const videoId = parseYouTubeVideoId(url)

    if (!videoId) {
      return NextResponse.json({ error: "invalid_url" }, { status: 400 })
    }

    const video = await getVideoInfo(videoId, "YouTube Video")

    if (!video.qualities.length || !video.defaultQualityId) {
      return NextResponse.json(
        { error: "no_qualities", message: "No downloadable qualities for this video" },
        { status: 422 }
      )
    }

    return NextResponse.json({
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      author: video.author,
      durationSeconds: video.durationSeconds,
      qualities: video.qualities,
      defaultQualityId: video.defaultQualityId,
    })
  } catch (error) {
    if (error instanceof ShortsApiError) {
      console.error("[api/video]", error.code, error.message)
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.code === "not_configured" ? 503 : 502 }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "unknown"
    console.error("[api/video]", message)
    return NextResponse.json({ error: "upstream", message }, { status: 502 })
  }
}
