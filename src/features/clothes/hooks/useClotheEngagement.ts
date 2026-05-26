import type { ClothesModel } from '@/shared/model/clothesModel'
import React from 'react'
import {
  addCommentToClothe,
  addFavoriteClothe,
  type ClotheCommentModel,
  getEngagementSnapshotForClothes,
  likeClothe,
  removeFavoriteClothe,
  unlikeClothe,
} from '@/src/features/clothes/clothesService'

type UseClotheEngagementOptions = {
  onError?: (message: string) => void
}

export function useClotheEngagement(
  clothes: ClothesModel[],
  options: UseClotheEngagementOptions = {},
) {
  const { onError } = options
  const [likesCountByClotheId, setLikesCountByClotheId] = React.useState<Record<string, number>>({})
  const [likedClotheIds, setLikedClotheIds] = React.useState<Set<string>>(new Set())
  const [favoriteClotheIds, setFavoriteClotheIds] = React.useState<Set<string>>(new Set())
  const [likeLoadingByClotheId, setLikeLoadingByClotheId] = React.useState<Record<string, boolean>>({})
  const [favoriteLoadingByClotheId, setFavoriteLoadingByClotheId] = React.useState<Record<string, boolean>>({})
  const [commentLoadingByClotheId, setCommentLoadingByClotheId] = React.useState<Record<string, boolean>>({})
  const [commentsByClotheId, setCommentsByClotheId] = React.useState<Record<string, ClotheCommentModel[]>>({})
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)
  const [userNamesByUserId, setUserNamesByUserId] = React.useState<Record<string, string>>({})

  const clotheIds = React.useMemo(() => clothes.map((item) => item.id), [clothes])

  const loadEngagement = React.useCallback(async () => {
    try {
      const snapshot = await getEngagementSnapshotForClothes(clotheIds)
      setLikesCountByClotheId(snapshot.likesCountByClotheId)
      setLikedClotheIds(snapshot.likedClotheIds)
      setFavoriteClotheIds(snapshot.favoriteClotheIds)
      setCommentsByClotheId(snapshot.commentsByClotheId)
      setCurrentUserId(snapshot.currentUserId)
      setUserNamesByUserId(snapshot.userNamesByUserId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les interactions.'
      onError?.(message)
    }
  }, [clotheIds, onError])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!mounted) return
      await loadEngagement()
    })()
    return () => {
      mounted = false
    }
  }, [loadEngagement])

  const toggleLike = React.useCallback(
    async (id: string, shouldLike: boolean) => {
      if (likeLoadingByClotheId[id]) {
        return
      }

      setLikeLoadingByClotheId((prev) => ({ ...prev, [id]: true }))
      setLikedClotheIds((prev) => {
        const next = new Set(prev)
        if (shouldLike) next.add(id)
        else next.delete(id)
        return next
      })
      setLikesCountByClotheId((prev) => ({
        ...prev,
        [id]: Math.max(0, (prev[id] ?? 0) + (shouldLike ? 1 : -1)),
      }))

      try {
        if (shouldLike) await likeClothe(id)
        else await unlikeClothe(id)
      } catch (error) {
        setLikedClotheIds((prev) => {
          const next = new Set(prev)
          if (shouldLike) next.delete(id)
          else next.add(id)
          return next
        })
        setLikesCountByClotheId((prev) => ({
          ...prev,
          [id]: Math.max(0, (prev[id] ?? 0) + (shouldLike ? -1 : 1)),
        }))
        const message = error instanceof Error ? error.message : 'Impossible de mettre a jour le like.'
        onError?.(message)
      } finally {
        setLikeLoadingByClotheId((prev) => ({ ...prev, [id]: false }))
      }
    },
    [likeLoadingByClotheId, onError],
  )

  const toggleFavorite = React.useCallback(
    async (id: string, shouldFavorite: boolean) => {
      if (favoriteLoadingByClotheId[id]) {
        return
      }

      setFavoriteLoadingByClotheId((prev) => ({ ...prev, [id]: true }))
      setFavoriteClotheIds((prev) => {
        const next = new Set(prev)
        if (shouldFavorite) next.add(id)
        else next.delete(id)
        return next
      })

      try {
        if (shouldFavorite) await addFavoriteClothe(id)
        else await removeFavoriteClothe(id)
      } catch (error) {
        setFavoriteClotheIds((prev) => {
          const next = new Set(prev)
          if (shouldFavorite) next.delete(id)
          else next.add(id)
          return next
        })
        const message = error instanceof Error ? error.message : 'Impossible de mettre a jour le favori.'
        onError?.(message)
      } finally {
        setFavoriteLoadingByClotheId((prev) => ({ ...prev, [id]: false }))
      }
    },
    [favoriteLoadingByClotheId, onError],
  )

  const addComment = React.useCallback(
    async (id: string, content: string) => {
      if (commentLoadingByClotheId[id]) {
        return
      }
      const trimmed = content.trim()
      if (!trimmed) {
        onError?.('Le commentaire ne peut pas etre vide.')
        return
      }

      setCommentLoadingByClotheId((prev) => ({ ...prev, [id]: true }))
      try {
        const inserted = await addCommentToClothe(id, trimmed)
        setCommentsByClotheId((prev) => ({
          ...prev,
          [id]: [inserted, ...(prev[id] ?? [])],
        }))
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Impossible d ajouter le commentaire.'
        onError?.(message)
      } finally {
        setCommentLoadingByClotheId((prev) => ({ ...prev, [id]: false }))
      }
    },
    [commentLoadingByClotheId, onError],
  )

  return {
    getCardEngagementProps: (clotheId: string) => ({
      likesCount: likesCountByClotheId[clotheId] ?? 0,
      isLikedByMe: likedClotheIds.has(clotheId),
      isLikeLoading: likeLoadingByClotheId[clotheId] ?? false,
      isFavoriteByMe: favoriteClotheIds.has(clotheId),
      isFavoriteLoading: favoriteLoadingByClotheId[clotheId] ?? false,
      comments: commentsByClotheId[clotheId] ?? [],
      commentsCount: (commentsByClotheId[clotheId] ?? []).length,
      isCommentLoading: commentLoadingByClotheId[clotheId] ?? false,
      currentUserId,
      userNamesByUserId,
      onToggleLike: toggleLike,
      onToggleFavorite: toggleFavorite,
      onAddComment: addComment,
    }),
    reloadEngagement: loadEngagement,
  }
}
