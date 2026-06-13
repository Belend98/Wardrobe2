import { clothingCrudService } from '@/src/composition/clothing'
import { usePaginatedClothes } from '@/src/presentation/hooks/clothes/usePaginatedClothes'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'

export function useMyClothes() {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const loadPage = useCallback(
    (pagination: Parameters<typeof clothingCrudService.getMyClothes>[0]) =>
      clothingCrudService.getMyClothes(pagination),
    [],
  )
  const pagination = usePaginatedClothes(loadPage)
  const { removeClothe } = pagination

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
    ...pagination,
    deletingId,
    deleteClothes,
  }
}
