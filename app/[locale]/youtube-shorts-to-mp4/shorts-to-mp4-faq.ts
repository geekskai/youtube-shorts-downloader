/** YouTube Shorts to MP4 page FAQ — shared by ShortsToMp4Main and JSON-LD */

export type ShortsToMp4FaqItem = {
  question: string
  answer: string
}

export const SHORTS_TO_MP4_FAQ_ITEMS: ShortsToMp4FaqItem[] = [
  {
    question: "How do I convert YouTube Shorts to MP4?",
    answer:
      "Copy the Shorts link from YouTube, paste it into the converter above, tap Get Video, then click Download MP4. The file saves to your device in standard MP4 format — no app or account required.",
  },
  {
    question: "Is YouTube Shorts to MP4 free?",
    answer:
      "Yes — 100% free. Convert any public Short to MP4 with no subscription, hidden fee, or sign-up.",
  },
  {
    question: "What MP4 quality can I get from Shorts?",
    answer:
      "Choose from 144p through 1080p HD MP4 — including 360p, 480p, and 720p — depending on what the source Short offers.",
  },
  {
    question: "Can I convert Shorts to MP4 on iPhone?",
    answer:
      "Yes. Open Safari or Chrome on iPhone, paste the Shorts URL, tap Get Video, then Download MP4. The MP4 file saves like any other browser download.",
  },
  {
    question: "Do I need software to convert Shorts to MP4?",
    answer:
      "No. This is a browser-based YouTube Shorts to MP4 converter. Paste a link on phone, tablet, or desktop — no install required.",
  },
  {
    question: "Is converting YouTube Shorts to MP4 safe?",
    answer:
      "Yes. The tool runs over HTTPS in your browser. We do not require your Google password, do not install software, and do not ask for sign-up.",
  },
  {
    question: "Why won't my Shorts convert to MP4?",
    answer:
      "Common causes: an invalid or private URL, network interruption, or region restrictions. Verify the link format (youtube.com/shorts/…), refresh, and try again.",
  },
  {
    question: "What URL formats work for Shorts to MP4?",
    answer:
      "Supports youtube.com/shorts/VIDEO_ID, youtu.be/VIDEO_ID, and youtube.com/watch?v=VIDEO_ID links.",
  },
]

export const SHORTS_TO_MP4_LAST_MODIFIED = "2026-05-27"
export const SHORTS_TO_MP4_LAST_MODIFIED_ISO = `${SHORTS_TO_MP4_LAST_MODIFIED}T12:00:00.000Z`

export function generateShortsToMp4FAQSchema(baseUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${baseUrl}#faq`,
    mainEntity: SHORTS_TO_MP4_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}
