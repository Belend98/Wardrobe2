import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import { CLOTHES_STALE_TIME_MS } from '@/src/shared/constants/clothesRefresh'
import { useCallback, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { clothingCrudService } from '@/src/composition/clothing'

export function useMyClothes() {
  const [clothes, setClothes] = useState<ClothesModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const lastLoadedAt = useRef(0)

  const loadClothes = useCallback(async () => {
    try {
      const data = await clothingCrudService.getMyClothes()
      setClothes(data)
      lastLoadedAt.current = Date.now()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    }
  }, [])

  const initializeClothes = useCallback(async () => {
    const isStale = Date.now() - lastLoadedAt.current >= CLOTHES_STALE_TIME_MS
    if (isStale) await loadClothes()
    setIsLoading(false)
  }, [loadClothes])

  const deleteClothes = useCallback(async (id: string) => {
    try {
      setDeletingId(id)
      await clothingCrudService.deleteMyClothe(id)
      setClothes((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible de supprimer ce vetement.'
      Alert.alert('Erreur', message)
    } finally {
      setDeletingId(null)
    }
  }, [])

  const refreshClothes = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await loadClothes()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadClothes])

  return {
    clothes,
    isLoading,
    isRefreshing,
    deletingId,
    loadClothes,
    initializeClothes,
    refreshClothes,
    deleteClothes,
    setIsLoading,
  }
}
