import { supabase } from '@/src/utils/supabase'
import { Buffer } from 'buffer'

const DEFAULT_BUCKET = 'clothes'
const DEFAULT_PRIVATE_BUCKET = 'clothes-private'
const PRIVATE_URL_PREFIX = 'private://'

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

async function toUint8ArrayFromLocalUri(uri: string) {
  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error("Impossible de lire l'image locale.")
  }

  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

export async function uploadClotheImageIfNeeded(
  userId: string,
  imageUrl: string,
  isPublic: boolean,
  imageBase64?: string | null,
) {
  if (!isLocalUri(imageUrl)) {
    return imageUrl
  }

  const binary = imageBase64
    ? toUint8Array(imageBase64)
    : await toUint8ArrayFromLocalUri(imageUrl)
  const extension = extensionFromMimeType('image/jpeg')
  const filePath = buildFilePath(userId, extension)
  const bucket = isPublic
    ? process.env.EXPO_PUBLIC_SUPABASE_CLOTHES_BUCKET ?? DEFAULT_BUCKET
    : process.env.EXPO_PUBLIC_SUPABASE_PRIVATE_CLOTHES_BUCKET ?? DEFAULT_PRIVATE_BUCKET

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, binary, { contentType: `image/${extension}`, upsert: false })

  if (uploadError) {
    throw uploadError
  }

  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    if (!data.publicUrl) {
      throw new Error("Impossible d'obtenir l'URL publique de l'image.")
    }
    return data.publicUrl
  }

  return `${PRIVATE_URL_PREFIX}${bucket}/${filePath}`
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

function extractPrivateLocation(imageUrl: string) {
  if (!imageUrl.startsWith(PRIVATE_URL_PREFIX)) {
    return null
  }

  const raw = imageUrl.slice(PRIVATE_URL_PREFIX.length)
  const slashIndex = raw.indexOf('/')
  if (slashIndex === -1) return null
  return {
    bucket: raw.slice(0, slashIndex),
    filePath: raw.slice(slashIndex + 1),
  }
}

export async function resolveClotheImageUrl(imageUrl: string) {
  const privateLocation = extractPrivateLocation(imageUrl)
  if (!privateLocation) {
    return imageUrl
  }

  const { data, error } = await supabase.storage
    .from(privateLocation.bucket)
    .createSignedUrl(privateLocation.filePath, 60 * 60)

  if (error) {
    throw error
  }

  if (!data.signedUrl) {
    throw new Error("Impossible de generer l'URL signee de l'image.")
  }

  return data.signedUrl
}

export async function deleteClotheImageIfStored(imageUrl: string) {
  const privateLocation = extractPrivateLocation(imageUrl)
  if (privateLocation) {
    const { error } = await supabase.storage.from(privateLocation.bucket).remove([privateLocation.filePath])
    if (error) {
      throw error
    }
    return
  }

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
