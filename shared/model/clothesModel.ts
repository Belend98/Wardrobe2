export interface ClothesModel {
  id: string
  userId: string
  name: string
  color?: string | null
  imageUrl: string
  description?: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateClothesModel = Omit<
  ClothesModel,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
>

export type UpdateClothesModel = Partial<CreateClothesModel>
