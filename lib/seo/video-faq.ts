/** YouTube Video Downloader page FAQ — shared by VideoMain and JSON-LD */

export type VideoFaqItem = {
  question: string
  answer: string
}

export const VIDEO_FAQ_ITEMS: VideoFaqItem[] = [
  {
    question: "How do I download a YouTube video?",
    answer:
      "Paste your YouTube video URL into the downloader, click Get Video, then Download MP4. The file saves to your device in seconds with no account required.",
  },
  {
    question: "Is this YouTube video downloader free?",
    answer:
      "Yes — it is completely free. There is no sign-up, subscription, or software install required.",
  },
  {
    question: "What URL formats are supported?",
    answer:
      "Supports youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID, youtube.com/embed/VIDEO_ID, and youtube.com/shorts/VIDEO_ID links.",
  },
  {
    question: "Can I download YouTube videos on mobile?",
    answer:
      "Yes. The downloader is mobile-first: paste a link in your phone browser, choose quality, and save the MP4 file locally.",
  },
]

export const VIDEO_LAST_MODIFIED = "2026-05-17"

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

export function generateVideoHowToSchema(baseUrl: string) {
  return {
    "@type": "HowTo",
    "@id": `${baseUrl}#howto`,
    name: "How to download YouTube videos as MP4",
    description:
      "Download any public YouTube video as an MP4 file using the browser-based downloader in three steps.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Copy the video link",
        text: "Open the video on YouTube and copy the share link from the app or browser.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Paste and fetch video",
        text: "Paste the URL into the downloader and click Get Video to load available qualities.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download MP4",
        text: "Select your preferred quality and click Download MP4 to save the file.",
      },
    ],
  }
}
