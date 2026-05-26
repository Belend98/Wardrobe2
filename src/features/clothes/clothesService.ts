import { supabase } from '@/src/utils/supabase'
import { mapRowToModel } from './clothes.mapper'
import {
  deleteFavorite,
  deleteLike,
  deleteClotheByIdAndUserId,
  findClotheByIdAndUserId,
  findClothesByIds,
  findClothesByUserId,
  findClothesByUserIds,
  findCommentsByClotheIds,
  findFavoritesByUserId,
  findFavoritesByUserIdAndClotheIds,
  findLikesByClotheIds,
  findPublicClothes,
  findUsernamesByUserIds,
  insertFavorite,
  insertLike,
  insertClothe,
  insertComment,
  updateClotheByIdAndUserId,
} from './clothes.repository'
import {
  deleteClotheImageIfStored,
  resolveClotheImageUrl,
  uploadClotheImageIfNeeded,
} from './clothes.storage'
import { getMyFriends } from '@/src/features/friend/friendrequestService'

export type CreateClothesInput = {
  name: string
  category?: string | null
  color?: string | null
  imageUrl: string
  imageBase64?: string | null
  description?: string | null
  isPublic?: boolean
}

export type UpdateClothesInput = Partial<CreateClothesInput>

export type ClotheCommentModel = {
  id: string
  clotheId: string
  userId: string
  content: string
  createdAt: string
}

export async function getCurrentUserIdOrThrow() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('Utilisateur non connecte.')
  }

  return user.id
}

export async function createMyClothe(input: CreateClothesInput) {
  const userId = await getCurrentUserIdOrThrow()
  const isPublic = input.isPublic ?? true
  const publicImageUrl = await uploadClotheImageIfNeeded(
    userId,
    input.imageUrl,
    isPublic,
    input.imageBase64,
  )

  const data = await insertClothe({
    user_id: userId,
    name: input.name,
    category: input.category ?? null,
    color: input.color ?? null,
    image_url: publicImageUrl,
    description: input.description ?? null,
    is_public: isPublic,
  })

  return mapRowToModel(data)
}

export async function getMyClothes() {
  const userId = await getCurrentUserIdOrThrow()
  const rows = await findClothesByUserId(userId)
  const mapped = rows.map(mapRowToModel)
  return Promise.all(
    mapped.map(async (item) => ({
      ...item,
      imageUrl: await resolveClotheImageUrl(item.imageUrl),
    })),
  )
}

export async function getMyClotheById(id: string) {
  const userId = await getCurrentUserIdOrThrow()
  const row = await findClotheByIdAndUserId(id, userId)

  if (!row) {
    throw new Error('Vetement introuvable ou non autorise.')
  }

  const mapped = mapRowToModel(row)
  return {
    ...mapped,
    imageUrl: await resolveClotheImageUrl(mapped.imageUrl),
  }
}

export async function updateMyClothe(id: string, input: UpdateClothesInput) {
  const userId = await getCurrentUserIdOrThrow()
  const existing = await findClotheByIdAndUserId(id, userId)

  if (!existing) {
    throw new Error('Vetement introuvable ou non autorise.')
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) payload.name = input.name
  if (input.color !== undefined) payload.color = input.color
  if (input.category !== undefined) payload.category = input.category
  const effectiveIsPublic = input.isPublic ?? existing.is_public
  if (input.imageUrl !== undefined) {
    const publicImageUrl = await uploadClotheImageIfNeeded(
      userId,
      input.imageUrl,
      effectiveIsPublic,
      input.imageBase64,
    )
    payload.image_url = publicImageUrl
  }
  if (input.description !== undefined) payload.description = input.description
  if (input.isPublic !== undefined) payload.is_public = input.isPublic

  const data = await updateClotheByIdAndUserId(id, userId, payload)

  if (!data) {
    throw new Error('Vetement introuvable ou non autorise.')
  }

  if (input.imageUrl !== undefined && existing.image_url !== data.image_url) {
    await deleteClotheImageIfStored(existing.image_url)
  }

  const mapped = mapRowToModel(data)
  return {
    ...mapped,
    imageUrl: await resolveClotheImageUrl(mapped.imageUrl),
  }
}

export async function deleteMyClothe(id: string) {
  const userId = await getCurrentUserIdOrThrow()
  const clothe = await findClotheByIdAndUserId(id, userId)

  if (!clothe) {
    throw new Error('Vetement introuvable ou non autorise.')
  }

  await deleteClotheImageIfStored(clothe.image_url)
  await deleteClotheByIdAndUserId(id, userId)
}

export async function getPublicClothes() {
  const rows = await findPublicClothes()
  const mapped = rows.map(mapRowToModel)
  return Promise.all(
    mapped.map(async (item) => ({
      ...item,
      imageUrl: await resolveClotheImageUrl(item.imageUrl),
    })),
  )
}

export async function getMyAndFriendsClothes() {
  const userId = await getCurrentUserIdOrThrow()
  const friends = await getMyFriends()
  const userIds = Array.from(new Set([userId, ...friends.map((friend) => friend.id)]))
  const rows = await findClothesByUserIds(userIds)
  const publicRowsOnly = rows.filter((row) => row.is_public === true)
  const mapped = publicRowsOnly.map(mapRowToModel)
  return Promise.all(
    mapped.map(async (item) => ({
      ...item,
      imageUrl: await resolveClotheImageUrl(item.imageUrl),
    })),
  )
}

export async function getLikesSnapshotForClothes(clotheIds: string[]) {
  const userId = await getCurrentUserIdOrThrow()
  const likes = await findLikesByClotheIds(clotheIds)

  const likesCountByClotheId: Record<string, number> = {}
  const likedClotheIds = new Set<string>()

  for (const like of likes) {
    likesCountByClotheId[like.clothe_id] = (likesCountByClotheId[like.clothe_id] ?? 0) + 1
    if (like.user_id === userId) {
      likedClotheIds.add(like.clothe_id)
    }
  }

  return {
    likesCountByClotheId,
    likedClotheIds,
  }
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
    if (like.user_id === userId) {
      likedClotheIds.add(like.clothe_id)
    }
  }

  for (const favorite of favorites) {
    favoriteClotheIds.add(favorite.clothe_id)
  }

  for (const comment of comments) {
    const mapped: ClotheCommentModel = {
      id: comment.id,
      clotheId: comment.clothe_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
    }
    if (!commentsByClotheId[comment.clothe_id]) {
      commentsByClotheId[comment.clothe_id] = []
    }
    commentsByClotheId[comment.clothe_id].push(mapped)
  }

  const commenterIds = Array.from(new Set(comments.map((comment) => comment.user_id)))
  const users = await findUsernamesByUserIds(commenterIds)
  for (const user of users) {
    userNamesByUserId[user.id] = user.username ?? 'Utilisateur'
  }

  return {
    likesCountByClotheId,
    likedClotheIds,
    favoriteClotheIds,
    commentsByClotheId,
    userNamesByUserId,
    currentUserId: userId,
  }
}

export async function likeClothe(clotheId: string) {
  const userId = await getCurrentUserIdOrThrow()
  try {
    await insertLike({ clothe_id: clotheId, user_id: userId })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return
    }
    throw error
  }
}

export async function unlikeClothe(clotheId: string) {
  const userId = await getCurrentUserIdOrThrow()
  await deleteLike({ clothe_id: clotheId, user_id: userId })
}

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
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return
    }
    throw error
  }
}

export async function removeFavoriteClothe(clotheId: string) {
  const userId = await getCurrentUserIdOrThrow()
  await deleteFavorite({ clothe_id: clotheId, user_id: userId })
}

export async function addCommentToClothe(clotheId: string, content: string) {
  const userId = await getCurrentUserIdOrThrow()
  const trimmed = content.trim()

  if (!trimmed) {
    throw new Error('Le commentaire ne peut pas etre vide.')
  }

  const row = await insertComment({
    clothe_id: clotheId,
    user_id: userId,
    content: trimmed,
  })

  return {
    id: row.id,
    clotheId: row.clothe_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  } as ClotheCommentModel
}
