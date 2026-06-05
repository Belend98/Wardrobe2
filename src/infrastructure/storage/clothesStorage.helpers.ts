import { Buffer } from 'buffer'
import { DEFAULT_BUCKET, PRIVATE_URL_PREFIX } from './clothesStorage.constants'

export function isLocalUri(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://')
}

export function extensionFromMimeType(mimeType?: string | null) {
  if (!mimeType) return 'jpg'
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('heic')) return 'heic'
  return 'jpg'
}

export function buildFilePath(userId: string, extension: string) {
  const date = new Date().toISOString().slice(0, 10)
  const random = Math.random().toString(36).slice(2, 10)
  return `${userId}/${date}/${random}.${extension}`
}

export function toUint8Array(base64: string) {
  return Uint8Array.from(Buffer.from(base64, 'base64'))
}

export async function toUint8ArrayFromLocalUri(uri: string) {
  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error("Impossible de lire l'image locale.")
  }

  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

export function getBucketName() {
  return process.env.EXPO_PUBLIC_SUPABASE_CLOTHES_BUCKET ?? DEFAULT_BUCKET
}

export function extractFilePathFromPublicUrl(publicUrl: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`
  const markerIndex = publicUrl.indexOf(marker)
  if (markerIndex === -1) return null
  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length))
}

export function extractPrivateLocation(imageUrl: string) {
  if (!imageUrl.startsWith(PRIVATE_URL_PREFIX)) return null

  const raw = imageUrl.slice(PRIVATE_URL_PREFIX.length)
  const slashIndex = raw.indexOf('/')
  if (slashIndex === -1) return null

  return {
    bucket: raw.slice(0, slashIndex),
    filePath: raw.slice(slashIndex + 1),
  }
}
