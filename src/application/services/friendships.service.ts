import { supabase } from '@/src/infrastructure/supabase/client'
import { authService } from '@/src/composition/auth'
import type { FriendItem } from '@/src/shared/types/friend.types'

export async function getMyFriends(): Promise<FriendItem[]> {
  const userId = await authService.getCurrentUserIdOrThrow()

  const { data: outgoingRows, error: outgoingError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)

  if (outgoingError) throw outgoingError

  const { data: incomingRows, error: incomingError } = await supabase
    .from('friendships')
    .select('user_id')
    .eq('friend_id', userId)

  if (incomingError) throw incomingError

  const outgoingIds = (outgoingRows ?? []).map((row) => row.friend_id as string)
  const incomingIds = (incomingRows ?? []).map((row) => row.user_id as string)
  const friendIds = Array.from(new Set([...outgoingIds, ...incomingIds]))

  if (friendIds.length === 0) return []

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, bio')
    .in('id', friendIds)
    .order('username', { ascending: true })

  if (usersError) throw usersError

  return (users ?? []).map((user) => ({
    id: user.id as string,
    username: user.username as string,
    bio: (user.bio as string | null) ?? null,
  }))
}

export async function removeFriend(friendId: string) {
  const userId = await authService.getCurrentUserIdOrThrow()

  if (friendId === userId) {
    throw new Error("Tu ne peux pas te supprimer toi-meme de tes amis.")
  }

  const { error: deleteOutgoingError } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId)

  if (deleteOutgoingError) throw deleteOutgoingError

  const { error: deleteIncomingError } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', friendId)
    .eq('friend_id', userId)

  if (deleteIncomingError) throw deleteIncomingError
}
