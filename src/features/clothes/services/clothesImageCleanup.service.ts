import { supabase } from '@/src/utils/supabase'
import { extractFilePathFromPublicUrl, extractPrivateLocation, getBucketName } from './clothesStorage.helpers'

export async function deleteClotheImageIfStored(imageUrl: string) {
  const privateLocation = extractPrivateLocation(imageUrl)
  if (privateLocation) {
    const { error } = await supabase.storage.from(privateLocation.bucket).remove([privateLocation.filePath])
    if (error) throw error
    return
  }

  const bucket = getBucketName()
  const filePath = extractFilePathFromPublicUrl(imageUrl, bucket)
  if (!filePath) return

  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) throw error
}
