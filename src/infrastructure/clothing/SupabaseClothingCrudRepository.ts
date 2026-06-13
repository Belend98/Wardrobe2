import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import type {
  ClothingRepository,
  CreateClothingRecord,
  UpdateClothingRecord,
} from '@/src/domain/repositories/ClothingRepository'
import {
  mapRowToModel,
  type ClothesRow,
} from '@/src/infrastructure/supabase/clothes.mapper'
import { supabase } from '@/src/infrastructure/supabase/client'

const CLOTHES_SELECT =
  'id, user_id, name, category, color, image_url, description, is_public, created_at, updated_at'

function toInsertPayload(data: CreateClothingRecord) {
  return {
    user_id: data.userId,
    name: data.name,
    category: data.category ?? null,
    color: data.color ?? null,
    image_url: data.imageUrl,
    description: data.description ?? null,
    is_public: data.isPublic,
  }
}

function toUpdatePayload(data: UpdateClothingRecord) {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.color !== undefined ? { color: data.color } : {}),
    ...(data.imageUrl !== undefined ? { image_url: data.imageUrl } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.isPublic !== undefined ? { is_public: data.isPublic } : {}),
    updated_at: new Date().toISOString(),
  }
}

function mapRows(rows: ClothesRow[]): ClothesModel[] {
  return rows.map(mapRowToModel)
}

export class SupabaseClothingCrudRepository implements ClothingRepository {
  async create(data: CreateClothingRecord): Promise<ClothesModel> {
    const { data: row, error } = await supabase
      .from('clothes')
      .insert(toInsertPayload(data))
      .select(CLOTHES_SELECT)
      .single()

    if (error) throw error
    return mapRowToModel(row)
  }

  async findByUserId(userId: string): Promise<ClothesModel[]> {
    const { data, error } = await supabase
      .from('clothes')
      .select(CLOTHES_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return mapRows(data ?? [])
  }

  async findByUserIds(userIds: string[]): Promise<ClothesModel[]> {
    if (userIds.length === 0) return []

    const { data, error } = await supabase
      .from('clothes')
      .select(CLOTHES_SELECT)
      .in('user_id', userIds)
      .order('created_at', { ascending: false })

    if (error) throw error
    return mapRows(data ?? [])
  }

  async findByIds(ids: string[]): Promise<ClothesModel[]> {
    if (ids.length === 0) return []

    const { data, error } = await supabase
      .from('clothes')
      .select(CLOTHES_SELECT)
      .in('id', ids)
      .order('created_at', { ascending: false })

    if (error) throw error
    return mapRows(data ?? [])
  }

  async findByIdAndUserId(id: string, userId: string): Promise<ClothesModel | null> {
    const { data, error } = await supabase
      .from('clothes')
      .select(CLOTHES_SELECT)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data ? mapRowToModel(data) : null
  }

  async findPublic(): Promise<ClothesModel[]> {
    const { data, error } = await supabase
      .from('clothes')
      .select(CLOTHES_SELECT)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return mapRows(data ?? [])
  }

  async update(
    id: string,
    userId: string,
    data: UpdateClothingRecord,
  ): Promise<ClothesModel | null> {
    const { data: row, error } = await supabase
      .from('clothes')
      .update(toUpdatePayload(data))
      .eq('id', id)
      .eq('user_id', userId)
      .select(CLOTHES_SELECT)
      .maybeSingle()

    if (error) throw error
    return row ? mapRowToModel(row) : null
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('clothes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

}
