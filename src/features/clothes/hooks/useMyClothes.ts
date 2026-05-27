import type { ClothesModel } from '@/shared/model/clothesModel'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { deleteMyClothe, getMyClothes } from '../../clothes/clothesService'
import {
  getMyClothesCache,
  hydrateMyClothesCache,
  persistMyClothesCache,
  setMyClothesCache,
} from '../services/clothesLists.cache'

export function useMyClothes() {
  const [clothes, setClothes] = useState<ClothesModel[]>(() => getMyClothesCache() ?? [])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadClothes = useCallback(async () => {
    try {
      const data = await getMyClothes()
      setClothes(data)
      await persistMyClothesCache(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    }
  }, [])

  const initializeClothes = useCallback(async () => {
    const hydrated = await hydrateMyClothesCache()
    if (hydrated && hydrated.length > 0) {
      setClothes(hydrated)
    }
    await loadClothes()
    setIsLoading(false)
  }, [loadClothes])

  const deleteClothes = useCallback(async (id: string) => {
    try {
      setDeletingId(id)
      await deleteMyClothe(id)
      setClothes((prev) => {
        const next = prev.filter((item) => item.id !== id)
        setMyClothesCache(next)
        void persistMyClothesCache(next)
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
