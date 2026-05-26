import type { ClothesModel } from '@/shared/model/clothesModel'

export type ClothesRow = {
  id: string
  user_id: string
  name: string
  color: string | null
  image_url: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export function mapRowToModel(row: ClothesRow): ClothesModel {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    imageUrl: row.image_url,
    description: row.description,
    isPublic: row.is_public,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
