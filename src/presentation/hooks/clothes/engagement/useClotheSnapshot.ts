import { clothingEngagementService } from '@/src/composition/clothingEngagement'
import { useCallback, useEffect, useRef, useState } from 'react'

type UseClotheSnapshotOptions = {
  onError?: (message: string) => void
}

export function useClotheSnapshot(clotheIds: string[], options: UseClotheSnapshotOptions = {}) {
  const { onError } = options
  const onErrorRef = useRef(onError)
  const [likesCountByClotheId, setLikesCountByClotheId] = useState<Record<string, number>>({})
  const [likedClotheIds, setLikedClotheIds] = useState<Set<string>>(new Set())
  const [favoriteClotheIds, setFavoriteClotheIds] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const loadEngagement = useCallback(async () => {
    try {
      const snapshot = await clothingEngagementService.getEngagementSnapshotForClothes(clotheIds)
      setLikesCountByClotheId(snapshot.likesCountByClotheId)
      setLikedClotheIds(snapshot.likedClotheIds)
      setFavoriteClotheIds(snapshot.favoriteClotheIds)
      setCurrentUserId(snapshot.currentUserId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les interactions.'
      onErrorRef.current?.(message)
    }
  }, [clotheIds])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!mounted) return
      await loadEngagement()
    })()
    return () => {
      mounted = false
    }
  }, [loadEngagement])

  return {
    likesCountByClotheId,
    setLikesCountByClotheId,
    likedClotheIds,
    setLikedClotheIds,
    favoriteClotheIds,
    setFavoriteClotheIds,
    currentUserId,
    loadEngagement,
  }
}
