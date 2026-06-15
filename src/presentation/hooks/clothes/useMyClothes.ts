import { clothingCrudService } from '@/src/composition/clothing'
import { useClothes } from '@/src/presentation/hooks/clothes/useClothes'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'

export function useMyClothes() {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const loadClothes = useCallback(() => clothingCrudService.getMyClothes(), [])
  const clothesState = useClothes(loadClothes)
  const { removeClothe } = clothesState

  const deleteClothes = useCallback(async (id: string) => {
    try {
      setDeletingId(id)
      await clothingCrudService.deleteMyClothe(id)
      removeClothe(id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible de supprimer ce vetement.'
      Alert.alert('Erreur', message)
    } finally {
      setDeletingId(null)
    }
  }, [removeClothe])

  return {
    ...clothesState,
    deletingId,
    deleteClothes,
  }
}
