import type { AuthService } from '@/src/application/services/authService'
import type { CreateUserModel } from '@/src/domain/entities/User'
import type { UserRepository } from '@/src/domain/repositories/UserRepository'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  createProfile(userId: string, data: CreateUserModel) {
    return this.userRepository.createProfile(userId, data)
  }

  getMyProfile(userId: string) {
    return this.userRepository.getProfile(userId)
  }

  async getCurrentUserProfileOrThrow() {
    const user = await this.authService.getCurrentUserOrThrow()
    const profile = await this.userRepository.getProfile(user.id)

    if (!profile) throw new Error('Profil introuvable.')

    return {
      ...profile,
      email: user.email,
    }
  }

  async updateCurrentUserProfile(data: CreateUserModel) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    await this.userRepository.updateProfile(userId, data)
  }

  async getCurrentUserClotheImageUrls() {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    return this.userRepository.getClotheImageUrls(userId)
  }

  async deleteCurrentUserAccountData() {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    await this.userRepository.deleteAccountData(userId)
  }
}
