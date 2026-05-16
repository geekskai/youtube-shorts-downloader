import { Innertube } from "youtubei.js"

let innertubePromise: Promise<Innertube> | null = null

export function getInnertube(): Promise<Innertube> {
  if (!innertubePromise) {
    innertubePromise = Innertube.create()
  }
  return innertubePromise
}
