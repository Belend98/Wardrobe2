import { clothingEngagementService } from '@/src/composition/clothingEngagement'
import { useEffect, useRef, useState } from 'react'

type UseClotheSnapshotOptions = {
  onError?: (message: string) => void
}

export function useClotheSnapshot(clotheIds: string[], options: UseClotheSnapshotOptions = {}) {
  const { onError } = options
  const onErrorRef = useRef(onError)
  const [likesCountByClotheId, setLikesCountByClotheId] = useState<Record<string, number>>({})
  const [likedClotheIds, setLikedClotheIds] = useState<Set<string>>(new Set())
  const [favoriteClotheIds, setFavoriteClotheIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    async function loadEngagement() {
      try {
        const snapshot = await clothingEngagementService.getEngagementSnapshotForClothes(clotheIds)
        setLikesCountByClotheId(snapshot.likesCountByClotheId)
        setLikedClotheIds(snapshot.likedClotheIds)
        setFavoriteClotheIds(snapshot.favoriteClotheIds)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Impossible de charger les interactions.'
        onErrorRef.current?.(message)
      }
    }

    loadEngagement()
  }, [clotheIds])

  return {
    likesCountByClotheId,
    setLikesCountByClotheId,
    likedClotheIds,
    setLikedClotheIds,
    favoriteClotheIds,
    setFavoriteClotheIds,
  }
}
