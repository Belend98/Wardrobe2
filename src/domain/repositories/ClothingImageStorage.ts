export interface StoredClothingImage {
  url: string
  wasCreated: boolean
}

export interface ClothingImageStorage {
  storeIfNeeded(
    userId: string,
    imageUrl: string,
    isPublic: boolean,
    imageBase64?: string | null,
    forceStore?: boolean,
  ): Promise<StoredClothingImage>
  resolveUrl(imageUrl: string): Promise<string>
  delete(imageUrl: string): Promise<void>
}
