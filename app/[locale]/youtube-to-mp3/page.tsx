import { setRequestLocale } from "next-intl/server"
import Mp3Main from "./Mp3Main"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function YouTubeToMp3Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <Mp3Main />
}
