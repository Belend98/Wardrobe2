import { supabase } from '@/src/utils/supabase'
import { mapRowToModel } from './clothes.mapper'
import {
  deleteClotheByIdAndUserId,
  findClotheByIdAndUserId,
  findClothesByUserId,
  findPublicClothes,
  insertClothe,
  updateClotheByIdAndUserId,
} from './clothes.repository'
import { deleteClotheImageIfStored, uploadClotheImageIfNeeded } from './clothes.storage'

export type CreateClothesInput = {
  name: string
  color?: string | null
  imageUrl: string
  imageBase64?: string | null
  description?: string | null
  isPublic?: boolean
}

export type UpdateClothesInput = Partial<CreateClothesInput>

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
  const publicImageUrl = await uploadClotheImageIfNeeded(
    userId,
    input.imageUrl,
    input.imageBase64,
  )

  const data = await insertClothe({
    user_id: userId,
    name: input.name,
    color: input.color ?? null,
    image_url: publicImageUrl,
    description: input.description ?? null,
    is_public: input.isPublic ?? true,
  })

  return mapRowToModel(data)
}

export async function getMyClothes() {
  const userId = await getCurrentUserIdOrThrow()
  const rows = await findClothesByUserId(userId)
  return rows.map(mapRowToModel)
}

export async function getMyClotheById(id: string) {
  const userId = await getCurrentUserIdOrThrow()
  const row = await findClotheByIdAndUserId(id, userId)

  if (!row) {
    throw new Error('Vetement introuvable ou non autorise.')
  }

  return mapRowToModel(row)
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
  if (input.imageUrl !== undefined) {
    const publicImageUrl = await uploadClotheImageIfNeeded(
      userId,
      input.imageUrl,
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

  return mapRowToModel(data)
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
  return rows.map(mapRowToModel)
}
