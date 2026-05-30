import axios from "axios"
import fileDownload from "js-file-download"

export function isVideoContentType(contentType: string): boolean {
  return (
    contentType.includes("octet-stream") ||
    contentType.includes("video") ||
    contentType.includes("mp4")
  )
}

export function isAudioContentType(contentType: string): boolean {
  return (
    contentType.includes("audio") ||
    contentType.includes("mpeg") ||
    contentType.includes("octet-stream")
  )
}

function percentFromDownloadProgress(loaded: number, total?: number): number {
  if (!total || total <= 0) return 0
  return Math.min(99, Math.round((loaded * 100) / total))
}

type DownloadFileWithProgressOptions = {
  url: string
  fileName: string
  onProgress: (percent: number) => void
  isValidContentType?: (contentType: string) => boolean
}

export async function downloadFileWithProgress({
  url,
  fileName,
  onProgress,
  isValidContentType = () => true,
}: DownloadFileWithProgressOptions): Promise<{ size: number }> {
  const response = await axios({
    method: "GET",
    url,
    responseType: "blob",
    onDownloadProgress: (event) => {
      onProgress(percentFromDownloadProgress(event.loaded, event.total))
    },
  })

  const contentType = String(response.headers["content-type"] || "")
  if (!isValidContentType(contentType)) {
    const maybeText = await (response.data as Blob).text()
    throw new Error(maybeText?.slice(0, 200) || "Invalid media response")
  }

  const blob = response.data as Blob
  fileDownload(blob, fileName)
  onProgress(100)

  return { size: blob.size }
}
