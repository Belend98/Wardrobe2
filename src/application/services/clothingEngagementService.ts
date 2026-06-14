import type { AuthService } from '@/src/application/services/authService'
import type { ClothingCrudService } from '@/src/application/services/clothesCrud.service'
import type { Pagination } from '@/src/domain/pagination'
import type { ClothingEngagementRepository } from '@/src/domain/repositories/ClothingEngagementRepository'

export class ClothingEngagementService {
  constructor(
    private readonly engagementRepository: ClothingEngagementRepository,
    private readonly authService: AuthService,
    private readonly clothingCrudService: ClothingCrudService,
  ) {}

  async getEngagementSnapshotForClothes(clotheIds: string[]) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const [likes, favoriteIds] = await Promise.all([
      this.engagementRepository.findLikes(clotheIds),
      this.engagementRepository.findFavoriteIds(userId, clotheIds),
    ])

    const likesCountByClotheId: Record<string, number> = {}
    const likedClotheIds = new Set<string>()

    for (const like of likes) {
      likesCountByClotheId[like.clotheId] =
        (likesCountByClotheId[like.clotheId] ?? 0) + 1
      if (like.userId === userId) likedClotheIds.add(like.clotheId)
    }

    return {
      likesCountByClotheId,
      likedClotheIds,
      favoriteClotheIds: new Set(favoriteIds),
    }
  }

  async likeClothe(clotheId: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    await this.engagementRepository.addLike(clotheId, userId)
  }

  async unlikeClothe(clotheId: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    await this.engagementRepository.removeLike(clotheId, userId)
  }

  async addFavoriteClothe(clotheId: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    await this.engagementRepository.addFavorite(clotheId, userId)
  }

  async removeFavoriteClothe(clotheId: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    await this.engagementRepository.removeFavorite(clotheId, userId)
  }

  async getMyFavoriteClothes(pagination: Pagination) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const favoriteIdsPage = await this.engagementRepository.findFavoriteIdsPage(userId, pagination)
    return {
      items: await this.clothingCrudService.getClothesByIds(favoriteIdsPage.items),
      hasMore: favoriteIdsPage.hasMore,
    }
  }
}
