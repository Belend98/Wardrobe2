import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import { useClotheFavorites } from '@/src/presentation/hooks/clothes/engagement/useClotheFavorites'
import { useClotheLikes } from '@/src/presentation/hooks/clothes/engagement/useClotheLikes'
import { useClotheSnapshot } from '@/src/presentation/hooks/clothes/engagement/useClotheSnapshot'
import { useMemo } from 'react'

type UseClotheEngagementOptions = {
  onError?: (message: string) => void
}

export function useClotheEngagement(
  clothes: ClothesModel[],
  options: UseClotheEngagementOptions = {},
) {
  const { onError } = options
  const clotheIds = useMemo(() => clothes.map((item) => item.id), [clothes])

  const snapshot = useClotheSnapshot(clotheIds, { onError })
  const likes = useClotheLikes({
    onError,
    likedClotheIds: snapshot.likedClotheIds,
    setLikedClotheIds: snapshot.setLikedClotheIds,
    setLikesCountByClotheId: snapshot.setLikesCountByClotheId,
  })
  const favorites = useClotheFavorites({
    onError,
    favoriteClotheIds: snapshot.favoriteClotheIds,
    setFavoriteClotheIds: snapshot.setFavoriteClotheIds,
  })
  return {
    getCardEngagementProps: (clotheId: string) => ({
      likesCount: snapshot.likesCountByClotheId[clotheId] ?? 0,
      isLikedByMe: likes.likedClotheIds.has(clotheId),
      isLikeLoading: likes.likeLoadingByClotheId[clotheId] ?? false,
      isFavoriteByMe: favorites.favoriteClotheIds.has(clotheId),
      isFavoriteLoading: favorites.favoriteLoadingByClotheId[clotheId] ?? false,
      onToggleLike: likes.toggleLike,
      onToggleFavorite: favorites.toggleFavorite,
    }),
  }
}
