import type { CreateUserModel } from '@/shared/model/userModel'
import { deleteClotheImageIfStored } from '@/src/features/clothes/clothes.storage'
import { supabase } from '@/src/utils/supabase'

export async function createProfile(userId: string, data: CreateUserModel) {
  const { error } = await supabase.from('users').upsert(
    {
      id: userId,
      username: data.username,
      bio: data.bio ?? null,
    },
    {
      onConflict: 'id',
    },
  )

  if (error) {
    throw error
  }
}

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, bio, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function getCurrentUserProfileOrThrow() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('Utilisateur non connecte.')

  const profile = await getMyProfile(user.id)
  if (!profile) throw new Error('Profil introuvable.')

  return {
    id: profile.id as string,
    username: (profile.username as string) ?? '',
    bio: (profile.bio as string | null) ?? null,
    createdAt: profile.created_at ? new Date(profile.created_at as string) : null,
    email: user.email ?? null,
  }
}

export async function updateCurrentUserProfile(data: CreateUserModel) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('Utilisateur non connecte.')

  const { error } = await supabase
    .from('users')
    .update({
      username: data.username,
      bio: data.bio ?? null,
    })
    .eq('id', user.id)

  if (error) throw error
}

export async function getCurrentUserClotheImageUrls() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('Utilisateur non connecte.')

  const { data, error } = await supabase
    .from('clothes')
    .select('image_url')
    .eq('user_id', user.id)

  if (error) throw error

  return (data ?? [])
    .map((row) => row.image_url as string | null)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
}

export async function deleteCurrentUserAccountData() {
  const imageUrls = await getCurrentUserClotheImageUrls()

  const { error } = await supabase.rpc('delete_current_user_account_data')

  if (error) throw error

  await Promise.all(
    imageUrls.map((imageUrl) => deleteClotheImageIfStored(imageUrl)),
  )
}
