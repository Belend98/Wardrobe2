import { CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import { useMyClothes } from '@/src/features/clothes/hooks/useMyClothes'
import { useGridColumns } from '@/src/features/user/hooks/useGridColumns'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

export function usePersonalClothesScreen() {
  const gridColumns = useGridColumns()
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)

  const { clothes, isLoading, isRefreshing, deletingId, loadClothes, refreshClothes, deleteClothes, setIsLoading } =
    useMyClothes()

  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        await loadClothes()
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [loadClothes, setIsLoading])

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

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  const handleEdit = useCallback((id: string) => {
    router.push({ pathname: '/clothes/[id]/edit', params: { id } })
  }, [])

  return {
    gridColumns,
    clothes: filteredClothes,
    isLoading,
    isRefreshing,
    deletingId,
    categoryFilter,
    setCategoryFilter,
    handleRefresh,
    confirmDelete,
    handleBack,
    handleEdit,
    getCardEngagementProps,
  }
}
