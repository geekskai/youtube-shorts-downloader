/** Homepage FAQ — shared by Main.tsx content and JSON-LD in layout */

export type HomeFaqItem = {
  question: string
  answer: string
}

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: "How do I download YouTube Shorts?",
    answer:
      "Paste your Shorts URL into YoutubeShortDownloader, click Get Video, then Download MP4. The file saves to your device in seconds with no account required.",
  },
  {
    question: "Is this YouTube Shorts downloader free?",
    answer:
      "Yes — YoutubeShortDownloader is completely free. There is no sign-up, subscription, or software install required.",
  },
  {
    question: "What URL formats are supported?",
    answer:
      "YoutubeShortDownloader supports youtube.com/shorts/VIDEO_ID, youtu.be/VIDEO_ID, and youtube.com/watch?v=VIDEO_ID links.",
  },
  {
    question: "Can I download YouTube Shorts on mobile?",
    answer:
      "Yes. The downloader is mobile-first: paste a link in your phone browser, choose quality, and save the MP4 file locally.",
  },
]

export const HOME_LAST_MODIFIED = "2026-05-16"

export function generateHomeFAQSchema(baseUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${baseUrl}#faq`,
    mainEntity: HOME_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function generateHomeHowToSchema(baseUrl: string) {
  return {
    "@type": "HowTo",
    "@id": `${baseUrl}#howto`,
    name: "How to download YouTube Shorts as MP4",
    description:
      "Download any YouTube Short as an MP4 file using YoutubeShortDownloader in three steps.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Copy the Shorts link",
        text: "Open the Short on YouTube and copy the share link from the app or browser.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Paste and fetch video",
        text: "Paste the URL into YoutubeShortDownloader and click Get Video to load available qualities.",
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
