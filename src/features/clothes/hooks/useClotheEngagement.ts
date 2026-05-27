import type { ClothesModel } from '@/shared/model/clothesModel'
import { useClotheComments } from '@/src/features/clothes/hooks/engagement/useClotheComments'
import { useClotheFavorites } from '@/src/features/clothes/hooks/engagement/useClotheFavorites'
import { useClotheLikes } from '@/src/features/clothes/hooks/engagement/useClotheLikes'
import { useClotheSnapshot } from '@/src/features/clothes/hooks/engagement/useClotheSnapshot'
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
  const comments = useClotheComments({
    onError,
    commentsByClotheId: snapshot.commentsByClotheId,
    setCommentsByClotheId: snapshot.setCommentsByClotheId,
  })

  return {
    getCardEngagementProps: (clotheId: string) => ({
      likesCount: snapshot.likesCountByClotheId[clotheId] ?? 0,
      isLikedByMe: likes.likedClotheIds.has(clotheId),
      isLikeLoading: likes.likeLoadingByClotheId[clotheId] ?? false,
      isFavoriteByMe: favorites.favoriteClotheIds.has(clotheId),
      isFavoriteLoading: favorites.favoriteLoadingByClotheId[clotheId] ?? false,
      comments: comments.commentsByClotheId[clotheId] ?? [],
      commentsCount: (comments.commentsByClotheId[clotheId] ?? []).length,
      isCommentLoading: comments.commentLoadingByClotheId[clotheId] ?? false,
      currentUserId: snapshot.currentUserId,
      userNamesByUserId: snapshot.userNamesByUserId,
      onToggleLike: likes.toggleLike,
      onToggleFavorite: favorites.toggleFavorite,
      onAddComment: comments.addComment,
    }),
    reloadEngagement: snapshot.loadEngagement,
  }
}
