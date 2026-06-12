import { ClothingCrudService } from '@/src/application/services/clothesCrud.service'
import { authService } from '@/src/composition/auth'
import { friendService } from '@/src/composition/friend'
import { SupabaseClothingCrudRepository } from '@/src/infrastructure/clothing/SupabaseClothingCrudRepository'
import { SupabaseClothingImageStorage } from '@/src/infrastructure/clothing/SupabaseClothingImageStorage'

const clothingRepository = new SupabaseClothingCrudRepository()
const clothingImageStorage = new SupabaseClothingImageStorage()

export const clothingCrudService = new ClothingCrudService(
  clothingRepository,
  clothingImageStorage,
  authService,
  async () => (await friendService.getMyFriends()).map((friend) => friend.id),
)
