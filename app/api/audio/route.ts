import { NextResponse } from "next/server"
import { z } from "zod"
import { getAudioInfo, isApiConfigured, ShortsApiError } from "@/lib/youtube/api"
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

    const audio = await getAudioInfo(videoId, "YouTube Audio")

    if (!audio.qualities.length || !audio.defaultQualityId) {
      return NextResponse.json(
        { error: "no_qualities", message: "No downloadable audio qualities for this video" },
        { status: 422 }
      )
    }

    return NextResponse.json({
      videoId: audio.videoId,
      title: audio.title,
      thumbnail: audio.thumbnail,
      author: audio.author,
      durationSeconds: audio.durationSeconds,
      qualities: audio.qualities,
      defaultQualityId: audio.defaultQualityId,
    })
  } catch (error) {
    if (error instanceof ShortsApiError) {
      console.error("[api/audio]", error.code, error.message)
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.code === "not_configured" ? 503 : 502 }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "unknown"
    console.error("[api/audio]", message)
    return NextResponse.json({ error: "upstream", message }, { status: 502 })
  }
}
