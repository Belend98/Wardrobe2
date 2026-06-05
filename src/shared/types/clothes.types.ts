export type CreateClothesInput = {
  name: string
  category?: string | null
  color?: string | null
  imageUrl: string
  imageBase64?: string | null
  description?: string | null
  isPublic?: boolean
}

export type UpdateClothesInput = Partial<CreateClothesInput>

export type ClotheCommentModel = {
  id: string
  clotheId: string
  userId: string
  content: string
  createdAt: string
}
