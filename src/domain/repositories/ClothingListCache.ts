import type { ClothesModel } from '@/src/domain/entities/ClothingItem'

export type ClothingListCacheKey = 'my' | 'discover' | 'favorite'

export interface ClothingListCache {
  getMemory(key: ClothingListCacheKey): ClothesModel[] | null
  setMemory(key: ClothingListCacheKey, clothes: ClothesModel[]): void
  hydrate(key: ClothingListCacheKey): Promise<ClothesModel[] | null>
  persist(key: ClothingListCacheKey, clothes: ClothesModel[]): Promise<void>
}
