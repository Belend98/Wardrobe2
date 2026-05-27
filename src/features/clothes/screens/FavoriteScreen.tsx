import type { ClothesModel } from '@/shared/model/clothesModel'
import ClothesFilter from '@/shared/components/ClothesFilter'
import ClotheCard from '@/src/features/clothes/component/ClotheCard'
import { CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { getMyFavoriteClothes } from '@/src/features/clothes/clothesService'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import {useState, useEffect, useCallback} from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

export default function FavoriteScreen() {
  const { width } = useWindowDimensions()
  const gridColumns = width < 900 ? 1 : Math.max(4, Math.min(6, Math.floor((width - 40) / 170)))
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [clothes, setClothes] = useState<ClothesModel[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)
  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  const loadFavorites = useCallback(async () => {
    try {
      const data = await getMyFavoriteClothes()
      setClothes(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les favoris.'
      Alert.alert('Erreur', message)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await loadFavorites()
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [loadFavorites])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadFavorites()
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredClothes = clothes.filter(
    (item) => categoryFilter === CLOTHES_CATEGORY_ALL || item.category === categoryFilter,
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Favoris</Text>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing || isLoading}
            style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : undefined]}
          >
            <Text style={styles.refreshButtonText}>
              {isRefreshing ? 'Rafraichissement...' : 'Rafraichir'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Tes vetements en favoris.</Text>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          key={`favorite-grid-${gridColumns}`}
          data={filteredClothes}
          numColumns={gridColumns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClotheCard item={item} {...getCardEngagementProps(item.id)} />}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateText}>Aucun favori pour le moment.</Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  centerState: {
    padding: 24,
    alignItems: 'center',
  },
  stateText: {
    color: '#6B7280',
  },
})
