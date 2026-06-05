export type { FriendItem, ReceivedFriendRequest } from '@/src/shared/types/friend.types'

export {
  getReceivedFriendRequests,
  respondToFriendRequest,
  sendFriendRequest,
} from '@/src/application/services/friendRequests.service'

export { getMyFriends, removeFriend } from '@/src/application/services/friendships.service'
