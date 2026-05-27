import { addFavoriteClothe, removeFavoriteClothe } from '@/src/features/clothes/clothesService'
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

type UseClotheFavoritesOptions = {
  onError?: (message: string) => void
  currentUserId: string | null
  favoriteClotheIds: Set<string>
  setFavoriteClotheIds: Dispatch<SetStateAction<Set<string>>>
}

export function useClotheFavorites({
  onError,
  currentUserId,
  favoriteClotheIds,
  setFavoriteClotheIds,
}: UseClotheFavoritesOptions) {
  const [favoriteLoadingByClotheId, setFavoriteLoadingByClotheId] = useState<Record<string, boolean>>({})

  const toggleFavorite = useCallback(
    async (id: string, shouldFavorite: boolean) => {
      if (favoriteLoadingByClotheId[id]) return

      setFavoriteLoadingByClotheId((prev) => ({ ...prev, [id]: true }))
      setFavoriteClotheIds((prev) => {
        const next = new Set(prev)
        if (shouldFavorite) next.add(id)
        else next.delete(id)
        return next
      })

      try {
        if (shouldFavorite) await addFavoriteClothe(id, currentUserId ?? undefined)
        else await removeFavoriteClothe(id, currentUserId ?? undefined)
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
    [currentUserId, favoriteLoadingByClotheId, onError, setFavoriteClotheIds],
  )

  return { favoriteClotheIds, favoriteLoadingByClotheId, toggleFavorite }
}
