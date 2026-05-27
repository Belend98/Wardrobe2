import type { ClothesModel } from '@/shared/model/clothesModel'
import ClothesFilter from '@/shared/components/ClothesFilter'
import ClotheCard from '@/src/features/clothes/component/ClotheCard'
import { CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { getMyFavoriteClothes } from '@/src/features/clothes/clothesService'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import {
  hydrateFavoriteClothesCache,
  persistFavoriteClothesCache,
} from '@/src/features/clothes/services/clothesLists.cache'
import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'

export default function FavoriteScreen() {
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
      await persistFavoriteClothesCache(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les favoris.'
      Alert.alert('Erreur', message)
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      const hydrated = await hydrateFavoriteClothesCache()
      if (active && hydrated && hydrated.length > 0) {
        setClothes(hydrated)
      }
      await loadFavorites()
    })()

    return () => {
      active = false
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
        <Text style={styles.title}>Favoris</Text>
        <Text style={styles.subtitle}>Tes vetements en favoris.</Text>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      <FlatList
        data={filteredClothes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClotheCard item={item} {...getCardEngagementProps(item.id)} />}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Aucun favori pour le moment.</Text>
          </View>
        }
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
