/** YouTube Video Downloader page FAQ — shared by VideoMain and JSON-LD */

export type VideoFaqItem = {
  question: string
  answer: string
}

export const VIDEO_FAQ_ITEMS: VideoFaqItem[] = [
  {
    question: "Is this a safe YouTube video downloader?",
    answer:
      "Yes. The tool works in your browser over HTTPS with no software install. We do not require your Google login or store your download history on our servers.",
  },
  {
    question: "Can I download YouTube videos in 1080p?",
    answer:
      "When the source video offers 1080p, you can select it and save MP4 in full HD. Lower resolutions (720p, 480p, 360p) are also available to save bandwidth.",
  },
  {
    question: "Is this YouTube downloader online free?",
    answer:
      "Yes — completely free with no subscription. Paste a public video link and download MP4 without paying or creating an account.",
  },
  {
    question: "Do I need to install an app?",
    answer:
      "No. This is a browser-based YouTube downloader online. Works on Windows, Mac, iPhone, and Android without the app store.",
  },
  {
    question: "Can I download YouTube videos without an app on mobile?",
    answer:
      "Yes. Open your mobile browser, paste the video URL, tap Get Video, then Download MP4. No native app required.",
  },
  {
    question: "Why is my YouTube video not downloading?",
    answer:
      "Check that the URL is a valid public watch, youtu.be, or embed link (not a private or age-gated video). Refresh the page and retry. For Shorts clips, use our YouTube Shorts downloader instead.",
  },
  {
    question: "What formats does the video downloader support?",
    answer:
      "MP4 is the primary format — compatible with editors, phones, and media players. Audio-only needs are covered by our YouTube audio downloader.",
  },
  {
    question: "What URL formats are supported?",
    answer:
      "Supports youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID, youtube.com/embed/VIDEO_ID, and youtube.com/shorts/VIDEO_ID links.",
  },
]

export const VIDEO_LAST_MODIFIED = "2026-05-27"
export const VIDEO_LAST_MODIFIED_ISO = `${VIDEO_LAST_MODIFIED}T12:00:00.000Z`

export function generateVideoFAQSchema(baseUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${baseUrl}#faq`,
    mainEntity: VIDEO_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}
