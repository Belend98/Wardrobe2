import { supabase } from '@/src/utils/supabase'
import { Buffer } from 'buffer'

const DEFAULT_BUCKET = 'clothes'

function isLocalUri(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://')
}

function extensionFromMimeType(mimeType?: string | null) {
  if (!mimeType) return 'jpg'
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('heic')) return 'heic'
  return 'jpg'
}

function buildFilePath(userId: string, extension: string) {
  const date = new Date().toISOString().slice(0, 10)
  const random = Math.random().toString(36).slice(2, 10)
  return `${userId}/${date}/${random}.${extension}` 
}

function toUint8Array(base64: string) {
  return Uint8Array.from(Buffer.from(base64, 'base64'))
}

export async function uploadClotheImageIfNeeded(
  userId: string,
  imageUrl: string,
  imageBase64?: string | null,
) {
  if (!isLocalUri(imageUrl)) {
    return imageUrl
  }

  if (!imageBase64) {
    throw new Error('Image locale invalide. Re-selectionne la photo.')
  }

  const binary = toUint8Array(imageBase64)
  const extension = extensionFromMimeType('image/jpeg')
  const filePath = buildFilePath(userId, extension)
  const bucket = process.env.EXPO_PUBLIC_SUPABASE_CLOTHES_BUCKET ?? DEFAULT_BUCKET

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, binary, { contentType: `image/${extension}`, upsert: false })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  if (!data.publicUrl) {
    throw new Error("Impossible d'obtenir l'URL publique de l'image.")
  }

  return data.publicUrl
}

function getBucketName() {
  return process.env.EXPO_PUBLIC_SUPABASE_CLOTHES_BUCKET ?? DEFAULT_BUCKET
}

function extractFilePathFromPublicUrl(publicUrl: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`
  const markerIndex = publicUrl.indexOf(marker)
  if (markerIndex === -1) return null
  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length))
}

export async function deleteClotheImageIfStored(imageUrl: string) {
  const bucket = getBucketName()
  const filePath = extractFilePathFromPublicUrl(imageUrl, bucket)

  if (!filePath) {
    return
  }

  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) {
    throw error
  }
}
