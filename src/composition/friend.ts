import { FriendService } from '@/src/application/services/friendService'
import { authService } from '@/src/composition/auth'
import { SupabaseFriendRepository } from '@/src/infrastructure/friend/SupabaseFriendRepository'

const friendRepository = new SupabaseFriendRepository()

export const friendService = new FriendService(friendRepository, authService)
