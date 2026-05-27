import type { ClothesModel } from '@/shared/model/clothesModel'
import AsyncStorage from '@react-native-async-storage/async-storage'

let discoverClothesCache: ClothesModel[] | null = null
let favoriteClothesCache: ClothesModel[] | null = null
let myClothesCache: ClothesModel[] | null = null
const DISCOVER_CLOTHES_KEY = 'cache:clothes:discover:v1'
const FAVORITE_CLOTHES_KEY = 'cache:clothes:favorite:v1'
const MY_CLOTHES_KEY = 'cache:clothes:my:v1'

export function getDiscoverClothesCache() {
  return discoverClothesCache
}

export function setDiscoverClothesCache(clothes: ClothesModel[]) {
  discoverClothesCache = clothes
}

export function getFavoriteClothesCache() {
  return favoriteClothesCache
}

export function setFavoriteClothesCache(clothes: ClothesModel[]) {
  favoriteClothesCache = clothes
}

export function getMyClothesCache() {
  return myClothesCache
}

export function setMyClothesCache(clothes: ClothesModel[]) {
  myClothesCache = clothes
}

export async function hydrateDiscoverClothesCache() {
  if (discoverClothesCache) return discoverClothesCache
  const raw = await AsyncStorage.getItem(DISCOVER_CLOTHES_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as ClothesModel[]
  discoverClothesCache = parsed
  return parsed
}

export async function persistDiscoverClothesCache(clothes: ClothesModel[]) {
  discoverClothesCache = clothes
  await AsyncStorage.setItem(DISCOVER_CLOTHES_KEY, JSON.stringify(clothes))
}

export async function hydrateFavoriteClothesCache() {
  if (favoriteClothesCache) return favoriteClothesCache
  const raw = await AsyncStorage.getItem(FAVORITE_CLOTHES_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as ClothesModel[]
  favoriteClothesCache = parsed
  return parsed
}

export async function persistFavoriteClothesCache(clothes: ClothesModel[]) {
  favoriteClothesCache = clothes
  await AsyncStorage.setItem(FAVORITE_CLOTHES_KEY, JSON.stringify(clothes))
}

export async function hydrateMyClothesCache() {
  if (myClothesCache) return myClothesCache
  const raw = await AsyncStorage.getItem(MY_CLOTHES_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as ClothesModel[]
  myClothesCache = parsed
  return parsed
}

export async function persistMyClothesCache(clothes: ClothesModel[]) {
  myClothesCache = clothes
  await AsyncStorage.setItem(MY_CLOTHES_KEY, JSON.stringify(clothes))
}
