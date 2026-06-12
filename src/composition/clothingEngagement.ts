import { ClothingEngagementService } from '@/src/application/services/clothingEngagementService'
import { authService } from '@/src/composition/auth'
import { clothingCrudService } from '@/src/composition/clothing'
import { SupabaseClothingEngagementRepository } from '@/src/infrastructure/clothing/SupabaseClothingEngagementRepository'

const clothingEngagementRepository = new SupabaseClothingEngagementRepository()

export const clothingEngagementService = new ClothingEngagementService(
  clothingEngagementRepository,
  authService,
  clothingCrudService,
)
