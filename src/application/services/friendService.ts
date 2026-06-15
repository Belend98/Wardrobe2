import type { AuthService } from '@/src/application/services/authService'
import type {
  FriendRepository,
  FriendRequestDecision,
} from '@/src/domain/repositories/FriendRepository'

export class FriendService {
  constructor(
    private readonly friendRepository: FriendRepository,
    private readonly authService: AuthService,
  ) {}

  async searchUserByUsername(rawUsername: string) {
    const username = rawUsername.trim()
    if (!username) return null

    return this.friendRepository.searchUserByUsername(username)
  }

  async sendFriendRequest(receiverId: string) {
    const senderId = await this.authService.getCurrentUserIdOrThrow()

    if (senderId === receiverId) {
      throw new Error("Tu ne peux pas t'ajouter toi-meme.")
    }

    if (await this.friendRepository.friendshipExists(senderId, receiverId)) {
      throw new Error('Vous etes deja amis.')
    }

    if (await this.friendRepository.pendingRequestExists(senderId, receiverId)) {
      throw new Error('Une demande est deja en cours entre vous.')
    }

    await this.friendRepository.createFriendRequest(senderId, receiverId)
  }

  async getReceivedFriendRequests() {
    const receiverId = await this.authService.getCurrentUserIdOrThrow()
    return this.friendRepository.getReceivedRequests(receiverId)
  }

  async respondToFriendRequest(
    requestId: string,
    decision: FriendRequestDecision,
  ) {
    const receiverId = await this.authService.getCurrentUserIdOrThrow()
    await this.friendRepository.respondToRequest(requestId, receiverId, decision)
  }

  async getMyFriends() {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    return this.friendRepository.getFriends(userId)
  }

  async removeFriend(friendId: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()

    if (friendId === userId) {
      throw new Error("Tu ne peux pas te supprimer toi-meme de tes amis.")
    }

    await this.friendRepository.removeFriendship(friendId)
  }
}
