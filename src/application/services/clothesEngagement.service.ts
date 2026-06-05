import {
  deleteLike,
  findCommentsByClotheIds,
  findFavoritesByUserIdAndClotheIds,
  findLikesByClotheIds,
  findUsernamesByUserIds,
  insertComment,
  insertLike,
} from '@/src/infrastructure/supabase/clothingSupabaseRepository'
import { getCurrentUserIdOrThrow } from '@/src/application/services/authService'
import type { ClotheCommentModel } from '@/src/shared/types/clothes.types'

export async function getLikesSnapshotForClothes(clotheIds: string[]) {
  const userId = await getCurrentUserIdOrThrow()
  const likes = await findLikesByClotheIds(clotheIds)

  const likesCountByClotheId: Record<string, number> = {}
  const likedClotheIds = new Set<string>()

  for (const like of likes) {
    likesCountByClotheId[like.clothe_id] = (likesCountByClotheId[like.clothe_id] ?? 0) + 1
    if (like.user_id === userId) likedClotheIds.add(like.clothe_id)
  }

  return { likesCountByClotheId, likedClotheIds }
}

export async function getEngagementSnapshotForClothes(clotheIds: string[]) {
  const userId = await getCurrentUserIdOrThrow()
  const [likes, favorites, comments] = await Promise.all([
    findLikesByClotheIds(clotheIds),
    findFavoritesByUserIdAndClotheIds(userId, clotheIds),
    findCommentsByClotheIds(clotheIds),
  ])

  const likesCountByClotheId: Record<string, number> = {}
  const likedClotheIds = new Set<string>()
  const favoriteClotheIds = new Set<string>()
  const commentsByClotheId: Record<string, ClotheCommentModel[]> = {}
  const userNamesByUserId: Record<string, string> = {}

  for (const like of likes) {
    likesCountByClotheId[like.clothe_id] = (likesCountByClotheId[like.clothe_id] ?? 0) + 1
    if (like.user_id === userId) likedClotheIds.add(like.clothe_id)
  }

  for (const favorite of favorites) favoriteClotheIds.add(favorite.clothe_id)

  for (const comment of comments) {
    const mapped: ClotheCommentModel = {
      id: comment.id,
      clotheId: comment.clothe_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
    }
    if (!commentsByClotheId[comment.clothe_id]) commentsByClotheId[comment.clothe_id] = []
    commentsByClotheId[comment.clothe_id].push(mapped)
  }

  const commenterIds = Array.from(new Set(comments.map((comment) => comment.user_id)))
  const users = await findUsernamesByUserIds(commenterIds)
  for (const user of users) userNamesByUserId[user.id] = user.username ?? 'Utilisateur'

  return {
    likesCountByClotheId,
    likedClotheIds,
    favoriteClotheIds,
    commentsByClotheId,
    userNamesByUserId,
    currentUserId: userId,
  }
}

export async function likeClothe(clotheId: string, userIdParam?: string) {
  const userId = userIdParam ?? (await getCurrentUserIdOrThrow())
  try {
    await insertLike({ clothe_id: clotheId, user_id: userId })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') return
    throw error
  }
}

export async function unlikeClothe(clotheId: string, userIdParam?: string) {
  const userId = userIdParam ?? (await getCurrentUserIdOrThrow())
  await deleteLike({ clothe_id: clotheId, user_id: userId })
}

export async function addCommentToClothe(clotheId: string, content: string, userIdParam?: string) {
  const userId = userIdParam ?? (await getCurrentUserIdOrThrow())
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Le commentaire ne peut pas etre vide.')

  const row = await insertComment({ clothe_id: clotheId, user_id: userId, content: trimmed })
  return {
    id: row.id,
    clotheId: row.clothe_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  } as ClotheCommentModel
}
