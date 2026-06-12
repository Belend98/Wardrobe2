import { supabase } from '@/src/infrastructure/supabase/client'
import { authService } from '@/src/composition/auth'
import type { ReceivedFriendRequest } from '@/src/shared/types/friend.types'

export async function sendFriendRequest(receiverId: string) {
  const senderId = await authService.getCurrentUserIdOrThrow()

  if (senderId === receiverId) {
    throw new Error("Tu ne peux pas t'ajouter toi-meme.")
  }

  const { data: existingFriendship, error: existingFriendshipError } = await supabase
    .from('friendships')
    .select('user_id, friend_id')
    .or(
      `and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`,
    )
    .limit(1)

  if (existingFriendshipError) throw existingFriendshipError
  if (existingFriendship && existingFriendship.length > 0) {
    throw new Error('Vous etes deja amis.')
  }

  const { data: existingPending, error: existingPendingError } = await supabase
    .from('friend_requests')
    .select('id')
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId},status.eq.pending),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId},status.eq.pending)`,
    )
    .limit(1)

  if (existingPendingError) throw existingPendingError
  if (existingPending && existingPending.length > 0) {
    throw new Error('Une demande est déjà en cours entre vous.')
  }

  const { error } = await supabase.from('friend_requests').insert({
    sender_id: senderId,
    receiver_id: receiverId,
    status: 'pending',
  })

  if (error) throw error
}

export async function getReceivedFriendRequests(): Promise<ReceivedFriendRequest[]> {
  const receiverId = await authService.getCurrentUserIdOrThrow()

  const { data: requests, error: requestsError } = await supabase
    .from('friend_requests')
    .select('id, sender_id, created_at')
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (requestsError) throw requestsError

  const rows = requests ?? []
  if (rows.length === 0) return []

  const senderIds = Array.from(new Set(rows.map((row) => row.sender_id as string)))
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, bio')
    .in('id', senderIds)

  if (usersError) throw usersError

  const usersById = new Map(
    (users ?? []).map((user) => [
      user.id as string,
      {
        username: user.username as string,
        bio: (user.bio as string | null) ?? null,
      },
    ]),
  )

  return rows.map((row) => {
    const senderId = row.sender_id as string
    const sender = usersById.get(senderId)

    return {
      id: row.id as string,
      senderId,
      senderUsername: sender?.username ?? 'inconnu',
      senderBio: sender?.bio ?? null,
      createdAt: row.created_at as string,
    }
  })
}

export async function respondToFriendRequest(requestId: string, decision: 'accepted' | 'rejected') {
  const receiverId = await authService.getCurrentUserIdOrThrow()

  const { data: requestRow, error: requestRowError } = await supabase
    .from('friend_requests')
    .select('id, sender_id, receiver_id, status')
    .eq('id', requestId)
    .eq('receiver_id', receiverId)
    .maybeSingle()

  if (requestRowError) throw requestRowError
  if (!requestRow) throw new Error('Demande introuvable.')
  if (requestRow.status !== 'pending') throw new Error('Cette demande a deja ete traitee.')

  const { error: updateError } = await supabase
    .from('friend_requests')
    .update({ status: decision, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')

  if (updateError) throw updateError

  if (decision === 'accepted') {
    const senderId = requestRow.sender_id as string
    const receiver = requestRow.receiver_id as string

    const { error: friendshipsError } = await supabase
      .from('friendships')
      .upsert([{ user_id: receiver, friend_id: senderId }], { onConflict: 'user_id,friend_id' })

    if (friendshipsError) throw friendshipsError
  }
}
