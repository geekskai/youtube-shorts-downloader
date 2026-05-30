const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_MP3_HOST ?? "youtube-mp310.p.rapidapi.com"

export type Mp3ClientErrorCode = "not_configured" | "upstream" | "no_download_url"

export class Mp3ClientError extends Error {
  constructor(
    message: string,
    readonly code: Mp3ClientErrorCode
  ) {
    super(message)
    this.name = "Mp3ClientError"
  }
}

/** Resolve MP3 CDN URL via RapidAPI (browser). */
export async function fetchMp3DownloadUrl(youtubeUrl: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY_MP3?.trim()
  if (!apiKey) {
    throw new Mp3ClientError(
      "Add NEXT_PUBLIC_RAPIDAPI_KEY_MP3 to .env.local and restart the dev server.",
      "not_configured"
    )
  }

  const res = await fetch(
    `https://${RAPIDAPI_HOST}/download/mp3?url=${encodeURIComponent(youtubeUrl.trim())}`,
    {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
      cache: "no-store",
    }
  )

  const text = await res.text()
  let data: { downloadUrl?: string; message?: string } | null = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Non-JSON body from upstream.
  }

  if (!res.ok) {
    throw new Mp3ClientError(
      (data?.message || text || res.statusText).slice(0, 300),
      "upstream"
    )
  }

  const downloadUrl = data?.downloadUrl?.trim()
  if (!downloadUrl) {
    throw new Mp3ClientError("No download URL returned", "no_download_url")
  }

  return downloadUrl
}
