export interface ClothingLike {
  clotheId: string
  userId: string
}

export interface ClothingEngagementRepository {
  findLikes(clotheIds: string[]): Promise<ClothingLike[]>
  addLike(clotheId: string, userId: string): Promise<void>
  removeLike(clotheId: string, userId: string): Promise<void>
  findFavoriteIds(userId: string, clotheIds?: string[]): Promise<string[]>
  addFavorite(clotheId: string, userId: string): Promise<void>
  removeFavorite(clotheId: string, userId: string): Promise<void>
}
