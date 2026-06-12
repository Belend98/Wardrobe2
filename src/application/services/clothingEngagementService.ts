import type { AuthService } from '@/src/application/services/authService'
import type { ClothingCrudService } from '@/src/application/services/clothesCrud.service'
import type {
  ClothingComment,
  ClothingEngagementRepository,
} from '@/src/domain/repositories/ClothingEngagementRepository'

export class ClothingEngagementService {
  constructor(
    private readonly engagementRepository: ClothingEngagementRepository,
    private readonly authService: AuthService,
    private readonly clothingCrudService: ClothingCrudService,
  ) {}

  async getEngagementSnapshotForClothes(clotheIds: string[]) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const [likes, favoriteIds, comments] = await Promise.all([
      this.engagementRepository.findLikes(clotheIds),
      this.engagementRepository.findFavoriteIds(userId, clotheIds),
      this.engagementRepository.findComments(clotheIds),
    ])

    const likesCountByClotheId: Record<string, number> = {}
    const likedClotheIds = new Set<string>()
    const commentsByClotheId: Record<string, ClothingComment[]> = {}

    for (const like of likes) {
      likesCountByClotheId[like.clotheId] =
        (likesCountByClotheId[like.clotheId] ?? 0) + 1
      if (like.userId === userId) likedClotheIds.add(like.clotheId)
    }

    for (const comment of comments) {
      if (!commentsByClotheId[comment.clotheId]) {
        commentsByClotheId[comment.clotheId] = []
      }
      commentsByClotheId[comment.clotheId].push(comment)
    }

    const commenterIds = Array.from(new Set(comments.map((comment) => comment.userId)))
    const userNamesByUserId = await this.engagementRepository.findUsernames(commenterIds)

    return {
      likesCountByClotheId,
      likedClotheIds,
      favoriteClotheIds: new Set(favoriteIds),
      commentsByClotheId,
      userNamesByUserId,
      currentUserId: userId,
    }
  }

  async likeClothe(clotheId: string, userId?: string) {
    await this.engagementRepository.addLike(
      clotheId,
      userId ?? (await this.authService.getCurrentUserIdOrThrow()),
    )
  }

  async unlikeClothe(clotheId: string, userId?: string) {
    await this.engagementRepository.removeLike(
      clotheId,
      userId ?? (await this.authService.getCurrentUserIdOrThrow()),
    )
  }

  async addFavoriteClothe(clotheId: string, userId?: string) {
    await this.engagementRepository.addFavorite(
      clotheId,
      userId ?? (await this.authService.getCurrentUserIdOrThrow()),
    )
  }

  async removeFavoriteClothe(clotheId: string, userId?: string) {
    await this.engagementRepository.removeFavorite(
      clotheId,
      userId ?? (await this.authService.getCurrentUserIdOrThrow()),
    )
  }

  async addCommentToClothe(clotheId: string, content: string, userId?: string) {
    const trimmed = content.trim()
    if (!trimmed) throw new Error('Le commentaire ne peut pas être vide.')

    return this.engagementRepository.addComment(
      clotheId,
      userId ?? (await this.authService.getCurrentUserIdOrThrow()),
      trimmed,
    )
  }

  async getMyFavoriteClothes() {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const favoriteIds = await this.engagementRepository.findFavoriteIds(userId)
    return this.clothingCrudService.getClothesByIds(favoriteIds)
  }
}
