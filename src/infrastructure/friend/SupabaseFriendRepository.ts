import type {
  FriendRepository,
  FriendRequestDecision,
} from '@/src/domain/repositories/FriendRepository'
import type {
  FriendItem,
  ReceivedFriendRequest,
  SearchedUser,
} from '@/src/shared/types/friend.types'
import { supabase } from '@/src/infrastructure/supabase/client'

export class SupabaseFriendRepository implements FriendRepository {
  async searchUserByUsername(username: string): Promise<SearchedUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, bio')
      .ilike('username', username)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id as string,
      username: data.username as string,
      bio: (data.bio as string | null) ?? null,
    }
  }

  async friendshipExists(firstUserId: string, secondUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .or(
        `and(user_id.eq.${firstUserId},friend_id.eq.${secondUserId}),and(user_id.eq.${secondUserId},friend_id.eq.${firstUserId})`,
      )
      .limit(1)

    if (error) throw error
    return Boolean(data?.length)
  }

  async pendingRequestExists(firstUserId: string, secondUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id')
      .or(
        `and(sender_id.eq.${firstUserId},receiver_id.eq.${secondUserId},status.eq.pending),and(sender_id.eq.${secondUserId},receiver_id.eq.${firstUserId},status.eq.pending)`,
      )
      .limit(1)

    if (error) throw error
    return Boolean(data?.length)
  }

  async createFriendRequest(senderId: string, receiverId: string): Promise<void> {
    const { error } = await supabase.from('friend_requests').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
    })

    if (error) throw error
  }

  async getReceivedRequests(receiverId: string): Promise<ReceivedFriendRequest[]> {
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

  async respondToRequest(
    requestId: string,
    receiverId: string,
    decision: FriendRequestDecision,
  ): Promise<void> {
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .eq('id', requestId)
      .eq('receiver_id', receiverId)
      .maybeSingle()

    if (requestError) throw requestError
    if (!request) throw new Error('Demande introuvable.')
    if (request.status !== 'pending') throw new Error('Cette demande a deja ete traitee.')

    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: decision, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending')

    if (updateError) throw updateError
    if (decision === 'rejected') return

    const { error: friendshipError } = await supabase
      .from('friendships')
      .upsert(
        [{ user_id: request.receiver_id, friend_id: request.sender_id }],
        { onConflict: 'user_id,friend_id' },
      )

    if (friendshipError) throw friendshipError
  }

  async getFriends(userId: string): Promise<FriendItem[]> {
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

    const friendIds = Array.from(
      new Set([
        ...(outgoingRows ?? []).map((row) => row.friend_id as string),
        ...(incomingRows ?? []).map((row) => row.user_id as string),
      ]),
    )

    if (friendIds.length === 0) return []

    const { data, error } = await supabase
      .from('users')
      .select('id, username, bio')
      .in('id', friendIds)
      .order('username', { ascending: true })

    if (error) throw error

    return (data ?? []).map((user) => ({
      id: user.id as string,
      username: user.username as string,
      bio: (user.bio as string | null) ?? null,
    }))
  }

  async removeFriendship(friendId: string): Promise<void> {
    const { data: wasDeleted, error } = await supabase.rpc('remove_friendship', {
      p_friend_id: friendId,
    })

    if (error) throw error
    if (!wasDeleted) throw new Error("Cette relation d'amitie n'existe plus.")
  }
}
