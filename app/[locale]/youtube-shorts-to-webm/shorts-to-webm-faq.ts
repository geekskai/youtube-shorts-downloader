/** YouTube Shorts to WebM page FAQ — shared by ShortsToWebmMain and JSON-LD */

export type ShortsToWebmFaqItem = {
  question: string
  answer: string
}

export const SHORTS_TO_WEBM_FAQ_ITEMS: ShortsToWebmFaqItem[] = [
  {
    question: "How do I convert YouTube Shorts to WebM?",
    answer:
      "Copy the Shorts link from YouTube, paste it into the converter above, tap Get Video, then click Download WebM. The file saves to your device in standard WebM format — no app or account required.",
  },
  {
    question: "Is YouTube Shorts to WebM free?",
    answer:
      "Yes — 100% free. Convert any public Short to WebM with no subscription, hidden fee, or sign-up.",
  },
  {
    question: "What WebM quality can I get from Shorts?",
    answer:
      "Choose from 144p through 1080p HD WebM — including 360p, 480p, and 720p — depending on what the source Short offers.",
  },
  {
    question: "Can I convert Shorts to WebM on iPhone?",
    answer:
      "Yes. Open Safari or Chrome on iPhone, paste the Shorts URL, tap Get Video, then Download WebM. The WebM file saves like any other browser download.",
  },
  {
    question: "Do I need software to convert Shorts to WebM?",
    answer:
      "No. This is a browser-based YouTube Shorts to WebM converter. Paste a link on phone, tablet, or desktop — no install required.",
  },
  {
    question: "Is converting YouTube Shorts to WebM safe?",
    answer:
      "Yes. The tool runs over HTTPS in your browser. We do not require your Google password, do not install software, and do not ask for sign-up.",
  },
  {
    question: "Why won't my Shorts convert to WebM?",
    answer:
      "Common causes: an invalid or private URL, network interruption, or region restrictions. Verify the link format (youtube.com/shorts/…), refresh, and try again.",
  },
  {
    question: "What URL formats work for Shorts to WebM?",
    answer:
      "Supports youtube.com/shorts/VIDEO_ID, youtu.be/VIDEO_ID, and youtube.com/watch?v=VIDEO_ID links.",
  },
]

export const SHORTS_TO_WEBM_LAST_MODIFIED = "2026-05-27"
export const SHORTS_TO_WEBM_LAST_MODIFIED_ISO = `${SHORTS_TO_WEBM_LAST_MODIFIED}T12:00:00.000Z`

export function generateShortsToWebmHowToSchema(baseUrl: string) {
  return {
    "@type": "HowTo",
    "@id": `${baseUrl}#howto`,
    name: "How to Convert YouTube Shorts to WebM",
    description:
      "Convert any YouTube Short to an HD WebM file in three steps — copy the link, paste, and download.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Copy the Shorts URL",
        text: "Open the Short on YouTube and copy the share link from the app or browser.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Paste the link",
        text: "Paste the URL into the converter and click Get Video to load available WebM qualities.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download WebM",
        text: "Select quality up to 1080p and click Download WebM to save the file to your device.",
      },
    ],
  }
}
