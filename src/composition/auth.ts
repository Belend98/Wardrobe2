import { AuthService } from '@/src/application/services/authService'
import { SupabaseAuthRepository } from '@/src/infrastructure/auth/SupabaseAuthRepository'

const authRepository = new SupabaseAuthRepository()

export const authService = new AuthService(authRepository)
