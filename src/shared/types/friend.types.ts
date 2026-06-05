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
