import type {
  ClothingImageStorage,
  StoredClothingImage,
} from '@/src/domain/repositories/ClothingImageStorage'
import {
  deleteClotheImageIfStored,
  resolveClotheImageUrl,
  uploadClotheImageIfNeeded,
} from '@/src/infrastructure/storage/clothes.storage'
import { isLocalUri } from '@/src/infrastructure/storage/clothesStorage.helpers'

export class SupabaseClothingImageStorage implements ClothingImageStorage {
  async storeIfNeeded(
    userId: string,
    imageUrl: string,
    isPublic: boolean,
    imageBase64?: string | null,
    forceStore = false,
  ): Promise<StoredClothingImage> {
    const wasCreated = isLocalUri(imageUrl) || forceStore
    const url = await uploadClotheImageIfNeeded(
      userId,
      imageUrl,
      isPublic,
      imageBase64,
      forceStore,
    )

    return { url, wasCreated }
  }

  resolveUrl(imageUrl: string): Promise<string> {
    return resolveClotheImageUrl(imageUrl)
  }

  delete(imageUrl: string): Promise<void> {
    return deleteClotheImageIfStored(imageUrl)
  }
}
