import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import type { PaginatedResult, Pagination } from '@/src/domain/pagination'

export type CreateClothingRecord = Omit<
  ClothesModel,
  'id' | 'createdAt' | 'updatedAt'
>

export type UpdateClothingRecord = Partial<
  Omit<ClothesModel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

export interface ClothingRepository {
  create(data: CreateClothingRecord): Promise<ClothesModel>
  findByUserId(userId: string, pagination: Pagination): Promise<PaginatedResult<ClothesModel>>
  findPublicByUserIds(userIds: string[], pagination: Pagination): Promise<PaginatedResult<ClothesModel>>
  findByIds(ids: string[]): Promise<ClothesModel[]>
  findByIdAndUserId(id: string, userId: string): Promise<ClothesModel | null>
  findPublic(pagination: Pagination): Promise<PaginatedResult<ClothesModel>>
  update(
    id: string,
    userId: string,
    data: UpdateClothingRecord,
  ): Promise<ClothesModel | null>
  delete(id: string, userId: string): Promise<void>
}
