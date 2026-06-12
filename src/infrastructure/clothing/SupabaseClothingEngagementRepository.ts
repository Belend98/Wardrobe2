import type {
  ClothingComment,
  ClothingEngagementRepository,
  ClothingLike,
} from '@/src/domain/repositories/ClothingEngagementRepository'
import { supabase } from '@/src/infrastructure/supabase/client'

function isDuplicateError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}

export class SupabaseClothingEngagementRepository
  implements ClothingEngagementRepository
{
  async findLikes(clotheIds: string[]): Promise<ClothingLike[]> {
    if (clotheIds.length === 0) return []

    const { data, error } = await supabase
      .from('clothes_likes')
      .select('clothe_id, user_id')
      .in('clothe_id', clotheIds)

    if (error) throw error

    return (data ?? []).map((like) => ({
      clotheId: like.clothe_id,
      userId: like.user_id,
    }))
  }

  async addLike(clotheId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('clothes_likes')
      .insert({ clothe_id: clotheId, user_id: userId })

    if (error && !isDuplicateError(error)) throw error
  }

  async removeLike(clotheId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('clothes_likes')
      .delete()
      .eq('clothe_id', clotheId)
      .eq('user_id', userId)

    if (error) throw error
  }

  async findFavoriteIds(userId: string, clotheIds?: string[]): Promise<string[]> {
    if (clotheIds?.length === 0) return []

    let query = supabase
      .from('clothes_favorites')
      .select('clothe_id')
      .eq('user_id', userId)

    if (clotheIds) query = query.in('clothe_id', clotheIds)

    const { data, error } = await query
    if (error) throw error

    return (data ?? []).map((favorite) => favorite.clothe_id)
  }

  async addFavorite(clotheId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('clothes_favorites')
      .insert({ clothe_id: clotheId, user_id: userId })

    if (error && !isDuplicateError(error)) throw error
  }

  async removeFavorite(clotheId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('clothes_favorites')
      .delete()
      .eq('clothe_id', clotheId)
      .eq('user_id', userId)

    if (error) throw error
  }

  async findComments(clotheIds: string[]): Promise<ClothingComment[]> {
    if (clotheIds.length === 0) return []

    const { data, error } = await supabase
      .from('clothes_comments')
      .select('id, clothe_id, user_id, content, created_at')
      .in('clothe_id', clotheIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((comment) => ({
      id: comment.id,
      clotheId: comment.clothe_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
    }))
  }

  async addComment(
    clotheId: string,
    userId: string,
    content: string,
  ): Promise<ClothingComment> {
    const { data, error } = await supabase
      .from('clothes_comments')
      .insert({ clothe_id: clotheId, user_id: userId, content })
      .select('id, clothe_id, user_id, content, created_at')
      .single()

    if (error) throw error

    return {
      id: data.id,
      clotheId: data.clothe_id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at,
    }
  }

  async findUsernames(userIds: string[]): Promise<Record<string, string>> {
    if (userIds.length === 0) return {}

    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds)

    if (error) throw error

    return Object.fromEntries(
      (data ?? []).map((user) => [user.id, user.username ?? 'Utilisateur']),
    )
  }
}
