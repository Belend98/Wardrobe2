import { supabase } from '@/src/infrastructure/supabase/client'
import { extractPrivateLocation } from './clothesStorage.helpers'

export async function resolveClotheImageUrl(imageUrl: string) {
  const privateLocation = extractPrivateLocation(imageUrl)
  if (!privateLocation) return imageUrl

  const { data, error } = await supabase.storage
    .from(privateLocation.bucket)
    .createSignedUrl(privateLocation.filePath, 60 * 60)

  if (error) throw error
  if (!data.signedUrl) throw new Error("Impossible de generer l'URL signée de l'image.")

  return data.signedUrl
}
