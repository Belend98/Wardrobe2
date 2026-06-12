import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import type {
  ClothingListCache,
  ClothingListCacheKey,
} from '@/src/domain/repositories/ClothingListCache'

const STORAGE_KEYS: Record<ClothingListCacheKey, string> = {
  my: 'cache:clothes:my:v1',
  discover: 'cache:clothes:discover:v1',
  favorite: 'cache:clothes:favorite:v1',
}

function deserializeClothes(raw: string): ClothesModel[] {
  const parsed = JSON.parse(raw) as (Omit<ClothesModel, 'createdAt' | 'updatedAt'> & {
    createdAt: string
    updatedAt: string
  })[]

  return parsed.map((clothe) => ({
    ...clothe,
    createdAt: new Date(clothe.createdAt),
    updatedAt: new Date(clothe.updatedAt),
  }))
}

export class AsyncStorageClothingListCache implements ClothingListCache {
  private readonly memory: Record<ClothingListCacheKey, ClothesModel[] | null> = {
    my: null,
    discover: null,
    favorite: null,
  }

  getMemory(key: ClothingListCacheKey) {
    return this.memory[key]
  }

  setMemory(key: ClothingListCacheKey, clothes: ClothesModel[]) {
    this.memory[key] = clothes
  }

  async hydrate(key: ClothingListCacheKey) {
    const memoryValue = this.getMemory(key)
    if (memoryValue) return memoryValue

    const raw = await AsyncStorage.getItem(STORAGE_KEYS[key])
    if (!raw) return null

    const clothes = deserializeClothes(raw)
    this.setMemory(key, clothes)
    return clothes
  }

  async persist(key: ClothingListCacheKey, clothes: ClothesModel[]) {
    this.setMemory(key, clothes)
    await AsyncStorage.setItem(STORAGE_KEYS[key], JSON.stringify(clothes))
  }
}
