import type { ClothesModel } from '@/src/domain/entities/ClothingItem'

export type CreateClothingRecord = Omit<
  ClothesModel,
  'id' | 'createdAt' | 'updatedAt'
>

export type UpdateClothingRecord = Partial<
  Omit<ClothesModel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

export interface ClothingRepository {
  create(data: CreateClothingRecord): Promise<ClothesModel>
  findByUserId(userId: string): Promise<ClothesModel[]>
  findByUserIds(userIds: string[]): Promise<ClothesModel[]>
  findByIds(ids: string[]): Promise<ClothesModel[]>
  findByIdAndUserId(id: string, userId: string): Promise<ClothesModel | null>
  findPublic(): Promise<ClothesModel[]>
  update(
    id: string,
    userId: string,
    data: UpdateClothingRecord,
  ): Promise<ClothesModel | null>
  delete(id: string, userId: string): Promise<void>
  findUsernamesByUserIds(userIds: string[]): Promise<Record<string, string>>
}
