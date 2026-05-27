export type { FriendItem, ReceivedFriendRequest } from './services/friend.types'

export {
  getReceivedFriendRequests,
  respondToFriendRequest,
  sendFriendRequest,
} from './services/friendRequests.service'

export { getMyFriends, removeFriend } from './services/friendships.service'
