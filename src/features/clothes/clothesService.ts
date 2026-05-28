export type { ClotheCommentModel, CreateClothesInput, UpdateClothesInput } from './services/clothes.types'

export { getCurrentUserIdOrThrow } from '@/src/features/auth/authService'

export {
  createMyClothe,
  getMyClothes,
  getMyClotheById,
  updateMyClothe,
  deleteMyClothe,
  getPublicClothes,
  getMyAndFriendsClothes,
  getUsernamesByUserIds,
} from './services/clothesCrud.service'

export {
  getLikesSnapshotForClothes,
  getEngagementSnapshotForClothes,
  likeClothe,
  unlikeClothe,
  addCommentToClothe,
} from './services/clothesEngagement.service'

export {
  getFavoriteClotheIds,
  getMyFavoriteClothes,
  addFavoriteClothe,
  removeFavoriteClothe,
} from './services/clothesFavorites.service'
