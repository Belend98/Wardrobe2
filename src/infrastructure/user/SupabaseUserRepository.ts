import type { CreateUserModel } from '@/src/domain/entities/User'
import type {
  UserProfile,
  UserRepository,
} from '@/src/domain/repositories/UserRepository'
import { deleteClotheImageIfStored } from '@/src/infrastructure/storage/clothes.storage'
import { supabase } from '@/src/infrastructure/supabase/client'

export class SupabaseUserRepository implements UserRepository {
  async createProfile(userId: string, data: CreateUserModel): Promise<void> {
    const { error } = await supabase.from('users').upsert(
      {
        id: userId,
        username: data.username,
        bio: data.bio ?? null,
      },
      {
        onConflict: 'id',
      },
    )

    if (error) throw error
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, bio, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id as string,
      username: (data.username as string) ?? '',
      bio: (data.bio as string | null) ?? null,
      createdAt: data.created_at ? new Date(data.created_at as string) : null,
    }
  }

  async updateProfile(userId: string, data: CreateUserModel): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        username: data.username,
        bio: data.bio ?? null,
      })
      .eq('id', userId)

    if (error) throw error
  }

  async getClotheImageUrls(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('clothes')
      .select('image_url')
      .eq('user_id', userId)

    if (error) throw error

    return (data ?? [])
      .map((row) => row.image_url as string | null)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
  }

  async deleteAccountData(userId: string): Promise<void> {
    const imageUrls = await this.getClotheImageUrls(userId)
    const { error } = await supabase.rpc('delete_current_user_account_data')

    if (error) throw error

    await Promise.all(imageUrls.map((imageUrl) => deleteClotheImageIfStored(imageUrl)))
  }
}
