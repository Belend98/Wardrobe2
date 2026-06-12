import type {
  FriendItem,
  ReceivedFriendRequest,
  SearchedUser,
} from '@/src/shared/types/friend.types'

export type FriendRequestDecision = 'accepted' | 'rejected'

export interface FriendRepository {
  searchUserByUsername(username: string): Promise<SearchedUser | null>
  friendshipExists(firstUserId: string, secondUserId: string): Promise<boolean>
  pendingRequestExists(firstUserId: string, secondUserId: string): Promise<boolean>
  createFriendRequest(senderId: string, receiverId: string): Promise<void>
  getReceivedRequests(receiverId: string): Promise<ReceivedFriendRequest[]>
  respondToRequest(
    requestId: string,
    receiverId: string,
    decision: FriendRequestDecision,
  ): Promise<void>
  getFriends(userId: string): Promise<FriendItem[]>
  removeFriendship(firstUserId: string, secondUserId: string): Promise<void>
}
