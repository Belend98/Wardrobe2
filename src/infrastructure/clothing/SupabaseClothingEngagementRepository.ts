import type {
  ClothingEngagementRepository,
  ClothingLike,
} from '@/src/domain/repositories/ClothingEngagementRepository'
import type { PaginatedResult, Pagination } from '@/src/domain/pagination'
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

  async findFavoriteIdsPage(
    userId: string,
    pagination: Pagination,
  ): Promise<PaginatedResult<string>> {
    const { data, error } = await supabase
      .from('clothes_favorites')
      .select('clothe_id')
      .eq('user_id', userId)
      .order('clothe_id', { ascending: true })
      .range(pagination.offset, pagination.offset + pagination.limit)

    if (error) throw error

    const ids = (data ?? []).map((favorite) => favorite.clothe_id)
    return {
      items: ids.slice(0, pagination.limit),
      hasMore: ids.length > pagination.limit,
    }
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

}
