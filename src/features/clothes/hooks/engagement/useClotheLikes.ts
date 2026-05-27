import { likeClothe, unlikeClothe } from '@/src/features/clothes/clothesService'
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

type UseClotheLikesOptions = {
  onError?: (message: string) => void
  likedClotheIds: Set<string>
  setLikedClotheIds: Dispatch<SetStateAction<Set<string>>>
  setLikesCountByClotheId: Dispatch<SetStateAction<Record<string, number>>>
}

export function useClotheLikes({
  onError,
  likedClotheIds,
  setLikedClotheIds,
  setLikesCountByClotheId,
}: UseClotheLikesOptions) {
  const [likeLoadingByClotheId, setLikeLoadingByClotheId] = useState<Record<string, boolean>>({})

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
    [likeLoadingByClotheId, onError, setLikedClotheIds, setLikesCountByClotheId],
  )

  return { likedClotheIds, likeLoadingByClotheId, toggleLike }
}
