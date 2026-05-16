import { NextRequest, NextResponse } from "next/server"
import { parseYouTubeVideoId } from "@/lib/youtube/parse-url"
import { fetchRapidShortsDownload, isRapidApiConfigured, waitForDownloadFile } from "@/lib/youtube/rapid-downloader"
import { getDownloadStreamUrl, resolveShortsVideo } from "@/lib/youtube/resolve-shorts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function safeFilename(title: string): string {
  return (
    title
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "youtube-short"
  )
}

export async function GET(request: NextRequest) {
  const videoIdParam = request.nextUrl.searchParams.get("videoId")
  const qualityParam = request.nextUrl.searchParams.get("quality")

  if (!videoIdParam) {
    return NextResponse.json({ error: "missing_video_id" }, { status: 400 })
  }

  const videoId = parseYouTubeVideoId(videoIdParam)
  if (!videoId) {
    return NextResponse.json({ error: "invalid_video_id" }, { status: 400 })
  }

  try {
    let streamUrl: string
    let mimeType: string
    let title: string

    if (isRapidApiConfigured() && qualityParam && qualityParam !== "best") {
      const resolved = await resolveShortsVideo(videoId)
      const link = await fetchRapidShortsDownload(videoId, qualityParam)
      streamUrl = await waitForDownloadFile(link)
      mimeType = link.mimeType
      title = resolved.title
    } else {
      const result = await getDownloadStreamUrl(videoId, qualityParam)
      streamUrl = result.url
      mimeType = result.mimeType
      title = result.title
    }

    const upstream = await fetch(streamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 })
    }

    const filename = `${safeFilename(title)}.mp4`

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "download_failed"
    console.error("[api/shorts/download]", message)
    return NextResponse.json({ error: "download_failed", message }, { status: 502 })
  }
}
