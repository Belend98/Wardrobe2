import { clothingEngagementService } from '@/src/composition/clothingEngagement'
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

type UseClotheLikesOptions = {
  onError?: (message: string) => void
  currentUserId: string | null
  likedClotheIds: Set<string>
  setLikedClotheIds: Dispatch<SetStateAction<Set<string>>>
  setLikesCountByClotheId: Dispatch<SetStateAction<Record<string, number>>>
}

export function useClotheLikes({
  onError,
  currentUserId,
  likedClotheIds,
  setLikedClotheIds,
  setLikesCountByClotheId,
}: UseClotheLikesOptions) {
  const onErrorRef = useRef(onError)
  const [likeLoadingByClotheId, setLikeLoadingByClotheId] = useState<Record<string, boolean>>({})

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const toggleLike = useCallback(
    async (id: string, shouldLike: boolean) => {
      if (likeLoadingByClotheId[id]) return

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
        if (shouldLike) await clothingEngagementService.likeClothe(id, currentUserId ?? undefined)
        else await clothingEngagementService.unlikeClothe(id, currentUserId ?? undefined)
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
        onErrorRef.current?.(message)
      } finally {
        setLikeLoadingByClotheId((prev) => ({ ...prev, [id]: false }))
      }
    },
    [currentUserId, likeLoadingByClotheId, setLikedClotheIds, setLikesCountByClotheId],
  )

  return { likedClotheIds, likeLoadingByClotheId, toggleLike }
}
