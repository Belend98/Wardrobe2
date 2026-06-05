import { supabase } from '@/src/infrastructure/supabase/client'

const CLOTHES_SELECT =
  'id, user_id, name, category, color, image_url, description, is_public, created_at, updated_at'

export async function insertClothe(payload: {
  user_id: string
  name: string
  category: string | null
  color: string | null
  image_url: string
  description: string | null
  is_public: boolean
}) {
  const { data, error } = await supabase
    .from('clothes')
    .insert(payload)
    .select(CLOTHES_SELECT)
    .single()

  if (error) throw error
  return data
}

export async function findClothesByUserId(userId: string) {
  const { data, error } = await supabase
    .from('clothes')
    .select(CLOTHES_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function findClothesByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('clothes')
    .select(CLOTHES_SELECT)
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function updateClotheByIdAndUserId(
  id: string,
  userId: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('clothes')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select(CLOTHES_SELECT)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function deleteClotheByIdAndUserId(id: string, userId: string) {
  const { error } = await supabase
    .from('clothes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function findClotheByIdAndUserId(id: string, userId: string) {
  const { data, error } = await supabase
    .from('clothes')
    .select(CLOTHES_SELECT)
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function findPublicClothes() {
  const { data, error } = await supabase
    .from('clothes')
    .select(CLOTHES_SELECT)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function findLikesByClotheIds(clotheIds: string[]) {
  if (clotheIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('clothes_likes')
    .select('clothe_id, user_id')
    .in('clothe_id', clotheIds)

  if (error) throw error
  return data ?? []
}

export async function insertLike(payload: { clothe_id: string; user_id: string }) {
  const { error } = await supabase.from('clothes_likes').insert(payload)
  if (error) throw error
}

export async function deleteLike(payload: { clothe_id: string; user_id: string }) {
  const { error } = await supabase
    .from('clothes_likes')
    .delete()
    .eq('clothe_id', payload.clothe_id)
    .eq('user_id', payload.user_id)

  if (error) throw error
}

export async function findFavoritesByUserId(userId: string) {
  const { data, error } = await supabase
    .from('clothes_favorites')
    .select('clothe_id')
    .eq('user_id', userId)

  if (error) throw error
  return data ?? []
}

export async function findFavoritesByUserIdAndClotheIds(userId: string, clotheIds: string[]) {
  if (clotheIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('clothes_favorites')
    .select('clothe_id')
    .eq('user_id', userId)
    .in('clothe_id', clotheIds)

  if (error) throw error
  return data ?? []
}

export async function findClothesByIds(clotheIds: string[]) {
  if (clotheIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('clothes')
    .select(CLOTHES_SELECT)
    .in('id', clotheIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function insertFavorite(payload: { clothe_id: string; user_id: string }) {
  const { error } = await supabase.from('clothes_favorites').insert(payload)
  if (error) throw error
}

export async function deleteFavorite(payload: { clothe_id: string; user_id: string }) {
  const { error } = await supabase
    .from('clothes_favorites')
    .delete()
    .eq('clothe_id', payload.clothe_id)
    .eq('user_id', payload.user_id)

  if (error) throw error
}

export async function findCommentsByClotheIds(clotheIds: string[]) {
  if (clotheIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('clothes_comments')
    .select('id, clothe_id, user_id, content, created_at')
    .in('clothe_id', clotheIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function insertComment(payload: {
  clothe_id: string
  user_id: string
  content: string
}) {
  const { data, error } = await supabase
    .from('clothes_comments')
    .insert(payload)
    .select('id, clothe_id, user_id, content, created_at')
    .single()

  if (error) throw error
  return data
}

export async function findUsernamesByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds)

  if (error) throw error
  return data ?? []
}
