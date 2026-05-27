import { mapRowToModel } from '../clothes.mapper'
import { deleteFavorite, findClothesByIds, findFavoritesByUserId, insertFavorite } from '../clothes.repository'
import { resolveClotheImageUrl } from '../clothes.storage'
import { getCurrentUserIdOrThrow } from './clothesAuth.service'

export async function getFavoriteClotheIds() {
  const userId = await getCurrentUserIdOrThrow()
  const favorites = await findFavoritesByUserId(userId)
  return new Set(favorites.map((favorite) => favorite.clothe_id))
}

export async function getMyFavoriteClothes() {
  const userId = await getCurrentUserIdOrThrow()
  const favorites = await findFavoritesByUserId(userId)
  const clotheIds = favorites.map((favorite) => favorite.clothe_id)
  const rows = await findClothesByIds(clotheIds)
  const mapped = rows.map(mapRowToModel)
  return Promise.all(
    mapped.map(async (item) => ({
      ...item,
      imageUrl: await resolveClotheImageUrl(item.imageUrl),
    })),
  )
}

export async function addFavoriteClothe(clotheId: string) {
  const userId = await getCurrentUserIdOrThrow()
  try {
    await insertFavorite({ clothe_id: clotheId, user_id: userId })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') return
    throw error
  }
}

export async function removeFavoriteClothe(clotheId: string) {
  const userId = await getCurrentUserIdOrThrow()
  await deleteFavorite({ clothe_id: clotheId, user_id: userId })
}
