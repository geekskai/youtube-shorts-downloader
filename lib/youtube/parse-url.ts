const VIDEO_ID_RE = /^[\w-]{11}$/

export function parseYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (VIDEO_ID_RE.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, "").toLowerCase()

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]
      return id && VIDEO_ID_RE.test(id) ? id : null
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2]
        return id && VIDEO_ID_RE.test(id) ? id : null
      }
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v")
        return id && VIDEO_ID_RE.test(id) ? id : null
      }
      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/")[2]
        return id && VIDEO_ID_RE.test(id) ? id : null
      }
    }
  } catch {
    return null
  }

  return null
}

export function isYouTubeUrl(input: string): boolean {
  return parseYouTubeVideoId(input) !== null
}
