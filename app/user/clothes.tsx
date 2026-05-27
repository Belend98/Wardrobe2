import { CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import ClothesFilter from '@/src/features/user/components/ClothesFilter'
import ClothesGrid from '@/src/features/user/components/ClothesGrid'
import { useGridColumns } from '@/src/features/user/hooks/useGridColumns'
import { usePersonalClothes } from '@/src/features/user/hooks/usePersonalClothes'
import { router } from 'expo-router'
import {useState, useEffect, useCallback} from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

export default function PersonalClothesScreen() {
  const gridColumns = useGridColumns()
  const { clothes, isLoading, isRefreshing, deletingId, loadClothes, refreshClothes, deleteClothes, setIsLoading } =
    usePersonalClothes()
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)

  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await loadClothes()
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [loadClothes, setIsLoading])

  const handleRefresh = useCallback(async () => {
    await refreshClothes()
  }, [refreshClothes])

  const confirmDelete = (id: string) => {
    Alert.alert('Supprimer', 'Confirmer la suppression de ce vetement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteClothes(id),
      },
    ])
  }

  const filteredClothes = clothes.filter(
    (item) => categoryFilter === CLOTHES_CATEGORY_ALL || item.category === categoryFilter,
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mes vetements</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing || isLoading}
              style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : undefined]}
            >
              <Text style={styles.refreshButtonText}>
                {isRefreshing ? 'Rafraichissement...' : 'Rafraichir'}
              </Text>
            </Pressable>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Retour</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.subtitle}>Affichage personnel de tes vetements.</Text>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      <ClothesGrid
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        gridColumns={gridColumns}
        clothes={filteredClothes}
        deletingId={deletingId}
        onRefresh={handleRefresh}
        onDelete={confirmDelete}
        onEdit={(id) => router.push({ pathname: '/clothes/[id]/edit', params: { id } })}
        getCardEngagementProps={getCardEngagementProps}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  refreshButton: {
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
  },
  refreshButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 12,
  },
})
