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

export async function deleteCurrentUserAccountData() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('Utilisateur non connecte.')

  const userId = user.id

  const { data: myClothes, error: clothesError } = await supabase
    .from('clothes')
    .select('id, image_url')
    .eq('user_id', userId)

  if (clothesError) throw clothesError

  const clotheIds = (myClothes ?? []).map((item) => item.id as string)
  const imageUrls = (myClothes ?? [])
    .map((item) => item.image_url as string | null)
    .filter((value): value is string => Boolean(value))

  if (clotheIds.length > 0) {
    const { error: deleteLikesByClothesError } = await supabase
      .from('clothes_likes')
      .delete()
      .in('clothe_id', clotheIds)
    if (deleteLikesByClothesError) throw deleteLikesByClothesError

    const { error: deleteFavoritesByClothesError } = await supabase
      .from('clothes_favorites')
      .delete()
      .in('clothe_id', clotheIds)
    if (deleteFavoritesByClothesError) throw deleteFavoritesByClothesError

    const { error: deleteCommentsByClothesError } = await supabase
      .from('clothes_comments')
      .delete()
      .in('clothe_id', clotheIds)
    if (deleteCommentsByClothesError) throw deleteCommentsByClothesError
  }

  const { error: deleteMyCommentsError } = await supabase
    .from('clothes_comments')
    .delete()
    .eq('user_id', userId)
  if (deleteMyCommentsError) throw deleteMyCommentsError

  const { error: deleteMyLikesError } = await supabase
    .from('clothes_likes')
    .delete()
    .eq('user_id', userId)
  if (deleteMyLikesError) throw deleteMyLikesError

  const { error: deleteMyFavoritesError } = await supabase
    .from('clothes_favorites')
    .delete()
    .eq('user_id', userId)
  if (deleteMyFavoritesError) throw deleteMyFavoritesError

  const { error: deleteMyClothesError } = await supabase.from('clothes').delete().eq('user_id', userId)
  if (deleteMyClothesError) throw deleteMyClothesError

  await Promise.all(imageUrls.map((imageUrl) => deleteClotheImageIfStored(imageUrl)))

  const { error: deleteFriendshipsLeftError } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', userId)
  if (deleteFriendshipsLeftError) throw deleteFriendshipsLeftError

  const { error: deleteFriendshipsRightError } = await supabase
    .from('friendships')
    .delete()
    .eq('friend_id', userId)
  if (deleteFriendshipsRightError) throw deleteFriendshipsRightError

  const { error: deleteFriendRequestsSentError } = await supabase
    .from('friend_requests')
    .delete()
    .eq('sender_id', userId)
  if (deleteFriendRequestsSentError) throw deleteFriendRequestsSentError

  const { error: deleteFriendRequestsReceivedError } = await supabase
    .from('friend_requests')
    .delete()
    .eq('receiver_id', userId)
  if (deleteFriendRequestsReceivedError) throw deleteFriendRequestsReceivedError

  const { error: deleteProfileError } = await supabase.from('users').delete().eq('id', userId)
  if (deleteProfileError) throw deleteProfileError

  const { error: deleteAuthUserError } = await supabase.rpc('delete_current_auth_user')
  if (deleteAuthUserError) throw deleteAuthUserError
}
