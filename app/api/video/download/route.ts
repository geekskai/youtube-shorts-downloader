import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getVideoDownloadLink,
  isApiConfigured,
  resolveReadyUrl,
  ShortsApiError,
} from "@/lib/youtube/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const querySchema = z.object({
  videoId: z.string().regex(/^[\w-]{11}$/),
  quality: z.string().min(1).max(32),
})

export async function GET(request: Request) {
  if (!isApiConfigured()) {
    return NextResponse.json(
      { error: "api_not_configured", message: "Set RAPIDAPI_KEY in .env.local" },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const { videoId, quality } = querySchema.parse({
      videoId: searchParams.get("videoId"),
      quality: searchParams.get("quality"),
    })

    const link = await getVideoDownloadLink(videoId, quality)
    const readyUrl = await resolveReadyUrl(link)

    return NextResponse.redirect(readyUrl, { status: 302 })
  } catch (error) {
    if (error instanceof ShortsApiError) {
      console.error("[api/video/download]", error.code, error.message)
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.code === "not_configured" ? 503 : 502 }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_params" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "unknown"
    console.error("[api/video/download]", message)
    return NextResponse.json({ error: "upstream", message }, { status: 502 })
  }
}
