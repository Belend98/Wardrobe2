import { getMyFriends } from '@/src/features/friend/friendrequestService'
import { mapRowToModel } from '../clothes.mapper'
import {
  deleteClotheByIdAndUserId,
  findClotheByIdAndUserId,
  findClothesByUserId,
  findClothesByUserIds,
  findPublicClothes,
  insertClothe,
  updateClotheByIdAndUserId,
} from '../clothes.repository'
import { deleteClotheImageIfStored, resolveClotheImageUrl, uploadClotheImageIfNeeded } from '../clothes.storage'
import { getCurrentUserIdOrThrow } from './clothesAuth.service'
import type { CreateClothesInput, UpdateClothesInput } from './clothes.types'

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
  if (!row) throw new Error('Vetement introuvable ou non autorise.')

  const mapped = mapRowToModel(row)
  return {
    ...mapped,
    imageUrl: await resolveClotheImageUrl(mapped.imageUrl),
  }
}

export async function updateMyClothe(id: string, input: UpdateClothesInput) {
  const userId = await getCurrentUserIdOrThrow()
  const existing = await findClotheByIdAndUserId(id, userId)
  if (!existing) throw new Error('Vetement introuvable ou non autorise.')

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) payload.name = input.name
  if (input.color !== undefined) payload.color = input.color
  if (input.category !== undefined) payload.category = input.category
  const effectiveIsPublic = input.isPublic ?? existing.is_public
  if (input.imageUrl !== undefined) {
    payload.image_url = await uploadClotheImageIfNeeded(
      userId,
      input.imageUrl,
      effectiveIsPublic,
      input.imageBase64,
    )
  }
  if (input.description !== undefined) payload.description = input.description
  if (input.isPublic !== undefined) payload.is_public = input.isPublic

  const data = await updateClotheByIdAndUserId(id, userId, payload)
  if (!data) throw new Error('Vetement introuvable ou non autorise.')

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
  if (!clothe) throw new Error('Vetement introuvable ou non autorise.')

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
  const mapped = rows
    .filter((row) => row.is_public === true)
    .map(mapRowToModel)

  return Promise.all(
    mapped.map(async (item) => ({
      ...item,
      imageUrl: await resolveClotheImageUrl(item.imageUrl),
    })),
  )
}
