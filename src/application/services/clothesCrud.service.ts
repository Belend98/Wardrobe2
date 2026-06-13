import type { AuthService } from '@/src/application/services/authService'
import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import type { PaginatedResult, Pagination } from '@/src/domain/pagination'
import type { ClothingImageStorage } from '@/src/domain/repositories/ClothingImageStorage'
import type {
  ClothingRepository,
  UpdateClothingRecord,
} from '@/src/domain/repositories/ClothingRepository'
import type {
  CreateClothesInput,
  UpdateClothesInput,
} from '@/src/shared/types/clothes.types'

type GetFriendIds = () => Promise<string[]>

export class ClothingCrudService {
  constructor(
    private readonly clothingRepository: ClothingRepository,
    private readonly imageStorage: ClothingImageStorage,
    private readonly authService: AuthService,
    private readonly getFriendIds: GetFriendIds,
  ) {}

  async createMyClothe(input: CreateClothesInput) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const isPublic = input.isPublic ?? true
    const storedImage = await this.imageStorage.storeIfNeeded(
      userId,
      input.imageUrl,
      isPublic,
      input.imageBase64,
    )

    try {
      return await this.clothingRepository.create({
        userId,
        name: input.name,
        category: input.category ?? null,
        color: input.color ?? null,
        imageUrl: storedImage.url,
        description: input.description ?? null,
        isPublic,
      })
    } catch (error) {
      if (storedImage.wasCreated) {
        try {
          await this.imageStorage.delete(storedImage.url)
        } catch {}
      }
      throw error
    }
  }

  async getMyClothes(pagination: Pagination): Promise<PaginatedResult<ClothesModel>> {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const page = await this.clothingRepository.findByUserId(userId, pagination)
    return this.resolveImagePage(page)
  }

  async getMyClotheById(id: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const clothe = await this.clothingRepository.findByIdAndUserId(id, userId)

    if (!clothe) throw new Error('Vetement introuvable ou non autorise.')

    return this.resolveImageUrl(clothe)
  }

  async updateMyClothe(id: string, input: UpdateClothesInput) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const existing = await this.clothingRepository.findByIdAndUserId(id, userId)

    if (!existing) throw new Error('Vetement introuvable ou non autorise.')

    const update: UpdateClothingRecord = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
    }

    const effectiveIsPublic = input.isPublic ?? existing.isPublic
    const visibilityChanged =
      input.isPublic !== undefined && input.isPublic !== existing.isPublic
    const storedImage = input.imageUrl
      ? await this.imageStorage.storeIfNeeded(
          userId,
          input.imageUrl,
          effectiveIsPublic,
          input.imageBase64,
          visibilityChanged,
        )
      : null

    if (storedImage?.wasCreated) {
      update.imageUrl = storedImage.url
    }

    let updated: ClothesModel | null
    try {
      updated = await this.clothingRepository.update(id, userId, update)
    } catch (error) {
      if (storedImage?.wasCreated) {
        try {
          await this.imageStorage.delete(storedImage.url)
        } catch {}
      }
      throw error
    }

    if (!updated) {
      if (storedImage?.wasCreated) {
        await this.imageStorage.delete(storedImage.url)
      }
      throw new Error('Vetement introuvable ou non autorise.')
    }

    if (storedImage?.wasCreated && existing.imageUrl !== updated.imageUrl) {
      await this.imageStorage.delete(existing.imageUrl)
    }

    return this.resolveImageUrl(updated)
  }

  async deleteMyClothe(id: string) {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const clothe = await this.clothingRepository.findByIdAndUserId(id, userId)

    if (!clothe) throw new Error('Vetement introuvable ou non autorise.')

    await this.clothingRepository.delete(id, userId)
    await this.imageStorage.delete(clothe.imageUrl)
  }

  async getPublicClothes(pagination: Pagination): Promise<PaginatedResult<ClothesModel>> {
    const page = await this.clothingRepository.findPublic(pagination)
    return this.resolveImagePage(page)
  }

  async getClothesByIds(ids: string[]) {
    const clothes = await this.clothingRepository.findByIds(Array.from(new Set(ids)))
    return this.resolveImageUrls(clothes)
  }

  async getMyAndFriendsClothes(pagination: Pagination): Promise<PaginatedResult<ClothesModel>> {
    const userId = await this.authService.getCurrentUserIdOrThrow()
    const friendIds = await this.getFriendIds()
    const userIds = Array.from(new Set([userId, ...friendIds]))
    const page = await this.clothingRepository.findPublicByUserIds(userIds, pagination)
    return this.resolveImagePage(page)
  }

  private async resolveImageUrl(clothe: ClothesModel): Promise<ClothesModel> {
    return {
      ...clothe,
      imageUrl: await this.imageStorage.resolveUrl(clothe.imageUrl),
    }
  }

  private resolveImageUrls(clothes: ClothesModel[]) {
    return Promise.all(clothes.map((clothe) => this.resolveImageUrl(clothe)))
  }

  private async resolveImagePage(
    page: PaginatedResult<ClothesModel>,
  ): Promise<PaginatedResult<ClothesModel>> {
    return {
      items: await this.resolveImageUrls(page.items),
      hasMore: page.hasMore,
    }
  }
}
