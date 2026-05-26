import { supabase } from '@/src/utils/supabase'

export type ReceivedFriendRequest = {
  id: string
  senderId: string
  senderUsername: string
  senderBio: string | null
  createdAt: string
}

export type FriendItem = {
  id: string
  username: string
  bio: string | null
}

async function getCurrentUserIdOrThrow() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error('Utilisateur non connecte.')

  return user.id
}

export async function sendFriendRequest(receiverId: string) {
  const senderId = await getCurrentUserIdOrThrow()

  if (senderId === receiverId) {
    throw new Error('Tu ne peux pas t\'ajouter toi-meme.')
  }

  const { data: existingPending, error: existingPendingError } = await supabase
    .from('friend_requests')
    .select('id')
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId},status.eq.pending),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId},status.eq.pending)`,
    )
    .limit(1)

  if (existingPendingError) {
    throw existingPendingError
  }

  if (existingPending && existingPending.length > 0) {
    throw new Error('Une demande est deja en cours entre vous.')
  }

  const { error } = await supabase.from('friend_requests').insert({
    sender_id: senderId,
    receiver_id: receiverId,
    status: 'pending',
  })

  if (error) {
    throw error
  }
}

export async function getReceivedFriendRequests(): Promise<ReceivedFriendRequest[]> {
  const receiverId = await getCurrentUserIdOrThrow()

  const { data: requests, error: requestsError } = await supabase
    .from('friend_requests')
    .select('id, sender_id, created_at')
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (requestsError) {
    throw requestsError
  }

  const rows = requests ?? []
  if (rows.length === 0) return []

  const senderIds = Array.from(new Set(rows.map((row) => row.sender_id as string)))

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, bio')
    .in('id', senderIds)

  if (usersError) {
    throw usersError
  }

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

export async function respondToFriendRequest(
  requestId: string,
  decision: 'accepted' | 'rejected',
) {
  const receiverId = await getCurrentUserIdOrThrow()

  const { data: requestRow, error: requestRowError } = await supabase
    .from('friend_requests')
    .select('id, sender_id, receiver_id, status')
    .eq('id', requestId)
    .eq('receiver_id', receiverId)
    .maybeSingle()

  if (requestRowError) {
    throw requestRowError
  }

  if (!requestRow) {
    throw new Error('Demande introuvable.')
  }

  if (requestRow.status !== 'pending') {
    throw new Error('Cette demande a deja ete traitee.')
  }

  if (decision === 'accepted') {
    const { error: acceptError } = await supabase
      .from('friend_requests')
      .update({ status: decision, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending')

    if (acceptError) {
      throw acceptError
    }

    const senderId = requestRow.sender_id as string
    const receiver = requestRow.receiver_id as string

    const { error: friendshipsError } = await supabase.from('friendships').upsert(
      [{ user_id: receiver, friend_id: senderId }],
      { onConflict: 'user_id,friend_id' },
    )

    if (friendshipsError) {
      throw friendshipsError
    }

    return
  }

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: decision, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')

  if (error) {
    throw error
  }
}

export async function getMyFriends(): Promise<FriendItem[]> {
  const userId = await getCurrentUserIdOrThrow()

  const { data: outgoingRows, error: outgoingError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)

  if (outgoingError) {
    throw outgoingError
  }

  const { data: incomingRows, error: incomingError } = await supabase
    .from('friendships')
    .select('user_id')
    .eq('friend_id', userId)

  if (incomingError) {
    throw incomingError
  }

  const outgoingIds = (outgoingRows ?? []).map((row) => row.friend_id as string)
  const incomingIds = (incomingRows ?? []).map((row) => row.user_id as string)
  const friendIds = Array.from(new Set([...outgoingIds, ...incomingIds]))

  if (friendIds.length === 0) {
    return []
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, bio')
    .in('id', friendIds)
    .order('username', { ascending: true })

  if (usersError) {
    throw usersError
  }

  return (users ?? []).map((user) => ({
    id: user.id as string,
    username: user.username as string,
    bio: (user.bio as string | null) ?? null,
  }))
}

export async function removeFriend(friendId: string) {
  const userId = await getCurrentUserIdOrThrow()

  if (friendId === userId) {
    throw new Error("Tu ne peux pas te supprimer toi-meme de tes amis.")
  }

  const { error: deleteOutgoingError } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId)

  if (deleteOutgoingError) {
    throw deleteOutgoingError
  }

  const { error: deleteIncomingError } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', friendId)
    .eq('friend_id', userId)

  if (deleteIncomingError) {
    throw deleteIncomingError
  }
}
