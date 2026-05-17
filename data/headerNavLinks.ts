export type HeaderNavMessageKey =
  | "header_nav_download"
  | "header_nav_video"
  | "header_nav_audio"
  | "header_nav_blog"

export type HeaderNavLink = {
  href: string
  title: HeaderNavMessageKey
  /** English fallback when a message key is not loaded yet */
  label: string
}

const headerNavLinks: HeaderNavLink[] = [
  { href: "/#downloader", title: "header_nav_download", label: "Shorts" },
  { href: "/youtube-video-downloader", title: "header_nav_video", label: "Video" },
  { href: "/youtube-audio-downloader", title: "header_nav_audio", label: "Audio" },
  { href: "/blog/", title: "header_nav_blog", label: "Blog" },
]

export default headerNavLinks
