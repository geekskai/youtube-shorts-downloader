import { Download, Smartphone, Video, Zap, type LucideIcon } from "lucide-react"

export interface ToolData {
  id: string
  title: string
  description: string
  icon: LucideIcon
  href: string
  features: string[]
  badge: string
  badgeColor: string
  gradient: string
  category: string
}

export const gradients = {
  productivity: "from-blue-500 to-purple-600",
  development: "from-emerald-500 to-teal-600",
  creative: "from-orange-500 to-red-500",
  entertainment: "from-purple-500 to-pink-500",
  communication: "from-pink-500 to-rose-500",
  analytics: "from-indigo-500 to-blue-600",
  education: "from-yellow-500 to-orange-500",
  utility: "from-teal-500 to-cyan-500",
  security: "from-red-500 to-pink-500",
  finance: "from-green-500 to-emerald-600",
}

export const toolsData: ToolData[] = [
  {
    id: "youtube-shorts-downloader",
    title: "YouTube Shorts Downloader",
    description:
      "Paste a YouTube Shorts link and download the video as MP4. Free, fast, and optimized for mobile and desktop browsers.",
    icon: Download,
    href: "/",
    features: [
      "Paste any public Shorts URL to start",
      "Save videos as MP4 for offline viewing",
      "No account or subscription required",
      "Mobile-friendly download workflow",
    ],
    badge: "Popular",
    badgeColor: "bg-red-500",
    gradient: gradients.entertainment,
    category: "Downloader",
  },
  {
    id: "shorts-to-mp4",
    title: "Shorts to MP4",
    description:
      "Convert YouTube Shorts links into downloadable MP4 files with a simple paste-and-save flow built for creators and editors.",
    icon: Video,
    href: "/",
    features: [
      "MP4 output for editing and archiving",
      "Quick copy-ready download links",
      "Works from phone, tablet, or desktop",
      "Free with no sign-up",
    ],
    badge: "MP4",
    badgeColor: "bg-cyan-500",
    gradient: gradients.creative,
    category: "Downloader",
  },
  {
    id: "mobile-shorts-download",
    title: "Mobile Shorts Download",
    description:
      "Download YouTube Shorts on your phone without installing an app. Paste the link, tap download, and save the clip.",
    icon: Smartphone,
    href: "/",
    features: [
      "Responsive UI for small screens",
      "No app install required",
      "Fast paste-and-download flow",
      "Built for on-the-go creators",
    ],
    badge: "Mobile",
    badgeColor: "bg-emerald-500",
    gradient: gradients.utility,
    category: "Downloader",
  },
  {
    id: "fast-shorts-save",
    title: "Fast Shorts Save",
    description:
      "Save YouTube Shorts quickly for reference, remix planning, or offline review. Lightweight interface with instant feedback.",
    icon: Zap,
    href: "/",
    features: [
      "Minimal steps from link to file",
      "Clear status and error messages",
      "Optimized for repeat downloads",
      "Free forever",
    ],
    badge: "Fast",
    badgeColor: "bg-purple-500",
    gradient: gradients.productivity,
    category: "Downloader",
  },
]

export default toolsData
