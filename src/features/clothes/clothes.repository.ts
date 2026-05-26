import { supabase } from '@/src/utils/supabase'

const CLOTHES_SELECT =
  'id, user_id, name, color, image_url, description, is_public, created_at, updated_at'

export async function insertClothe(payload: {
  user_id: string
  name: string
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
