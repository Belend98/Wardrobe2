import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { clothingCrudService } from '@/src/composition/clothing'
import { clothingListCache } from '@/src/composition/clothingListCache'

export function useMyClothes() {
  const [clothes, setClothes] = useState<ClothesModel[]>(
    () => clothingListCache.getMemory('my') ?? [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadClothes = useCallback(async () => {
    try {
      const data = await clothingCrudService.getMyClothes()
      setClothes(data)
      await clothingListCache.persist('my', data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    }
  }, [])

  const initializeClothes = useCallback(async () => {
    const hydrated = await clothingListCache.hydrate('my')
    if (hydrated && hydrated.length > 0) {
      setClothes(hydrated)
    }
    await loadClothes()
    setIsLoading(false)
  }, [loadClothes])

  const deleteClothes = useCallback(async (id: string) => {
    try {
      setDeletingId(id)
      await clothingCrudService.deleteMyClothe(id)
      setClothes((prev) => {
        const next = prev.filter((item) => item.id !== id)
        clothingListCache.setMemory('my', next)
        void clothingListCache.persist('my', next)
        return next
      })
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
