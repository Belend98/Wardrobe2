import { CLOTHES_CATEGORY_ALL } from '@/src/shared/constants/clothesCategories'
import { useClotheEngagement } from '@/src/presentation/hooks/clothes/useClotheEngagement'
import { useMyClothes } from '@/src/presentation/hooks/clothes/useMyClothes'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

export function usePersonalClothesScreen() {
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)

  const { clothes, isLoading, isRefreshing, deletingId, initializeClothes, refreshClothes, deleteClothes } =
    useMyClothes()

  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  useEffect(() => {
    void initializeClothes()
  }, [initializeClothes])

  const handleRefresh = useCallback(async () => {
    await refreshClothes()
  }, [refreshClothes])

  const confirmDelete = useCallback(
    (id: string) => {
      Alert.alert('Supprimer', 'Confirmer la suppression de ce vetement ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteClothes(id),
        },
      ])
    },
    [deleteClothes],
  )

  const filteredClothes = useMemo(() => {
    return clothes.filter(
      (item) => categoryFilter === CLOTHES_CATEGORY_ALL || item.category === categoryFilter,
    )
  }, [clothes, categoryFilter])

  const handleEdit = useCallback((id: string) => {
    router.push({ pathname: '/clothes/[id]/edit', params: { id } })
  }, [])

  return {
    clothes: filteredClothes,
    isLoading,
    isRefreshing,
    deletingId,
    categoryFilter,
    setCategoryFilter,
    handleRefresh,
    confirmDelete,
    handleEdit,
    getCardEngagementProps,
  }
}
