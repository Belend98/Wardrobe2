import { supabase } from '@/src/utils/supabase'
import { DEFAULT_BUCKET, DEFAULT_PRIVATE_BUCKET, PRIVATE_URL_PREFIX } from './clothesStorage.constants'
import { buildFilePath, extensionFromMimeType, isLocalUri, toUint8Array, toUint8ArrayFromLocalUri } from './clothesStorage.helpers'

export async function uploadClotheImageIfNeeded(
  userId: string,
  imageUrl: string,
  isPublic: boolean,
  imageBase64?: string | null,
) {
  if (!isLocalUri(imageUrl)) return imageUrl

  const binary = imageBase64 ? toUint8Array(imageBase64) : await toUint8ArrayFromLocalUri(imageUrl)
  const extension = extensionFromMimeType('image/jpeg')
  const filePath = buildFilePath(userId, extension)
  const bucket = isPublic
    ? process.env.EXPO_PUBLIC_SUPABASE_CLOTHES_BUCKET ?? DEFAULT_BUCKET
    : process.env.EXPO_PUBLIC_SUPABASE_PRIVATE_CLOTHES_BUCKET ?? DEFAULT_PRIVATE_BUCKET

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, binary, { contentType: `image/${extension}`, upsert: false })

  if (uploadError) throw uploadError

  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    if (!data.publicUrl) throw new Error("Impossible d'obtenir l'URL publique de l'image.")
    return data.publicUrl
  }

  return `${PRIVATE_URL_PREFIX}${bucket}/${filePath}`
}
