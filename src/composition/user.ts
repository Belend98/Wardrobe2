import { UserService } from '@/src/application/services/userService'
import { authService } from '@/src/composition/auth'
import { SupabaseUserRepository } from '@/src/infrastructure/user/SupabaseUserRepository'

const userRepository = new SupabaseUserRepository()

export const userService = new UserService(userRepository, authService)
