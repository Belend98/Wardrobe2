import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import { CLOTHES_STALE_TIME_MS } from '@/src/shared/constants/clothesRefresh'
import { useCallback, useRef, useState } from 'react'
import { Alert } from 'react-native'

type LoadClothes = () => Promise<ClothesModel[]>

export function useClothes(loadClothes: LoadClothes) {
  const [clothes, setClothes] = useState<ClothesModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const clothesRef = useRef<ClothesModel[]>([])
  const isBusyRef = useRef(false)
  const lastLoadedAt = useRef(0)

  const replaceClothes = useCallback((items: ClothesModel[]) => {
    clothesRef.current = items
    setClothes(items)
  }, [])

  const fetchClothes = useCallback(async () => {
    if (isBusyRef.current) return

    isBusyRef.current = true
    try {
      replaceClothes(await loadClothes())
      lastLoadedAt.current = Date.now()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    } finally {
      isBusyRef.current = false
    }
  }, [loadClothes, replaceClothes])

  const initializeClothes = useCallback(async () => {
    const isStale = Date.now() - lastLoadedAt.current >= CLOTHES_STALE_TIME_MS
    if (isStale) await fetchClothes()
    setIsLoading(false)
  }, [fetchClothes])

  const refreshClothes = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchClothes()
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchClothes])

  const removeClothe = useCallback((id: string) => {
    replaceClothes(clothesRef.current.filter((item) => item.id !== id))
  }, [replaceClothes])

  return {
    clothes,
    isLoading,
    isRefreshing,
    initializeClothes,
    refreshClothes,
    removeClothe,
  }
}
