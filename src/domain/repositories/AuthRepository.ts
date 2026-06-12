import type { AuthUser } from '@/src/domain/entities/AuthUser'

export interface AuthResult {
  user: AuthUser | null
  hasSession: boolean
}

export interface AuthRepository {
  signUp(email: string, password: string): Promise<AuthResult>
  signIn(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<void>
  getCurrentUser(): Promise<AuthUser | null>
}
