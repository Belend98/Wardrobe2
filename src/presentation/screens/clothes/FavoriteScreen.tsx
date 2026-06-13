import { clothingEngagementService } from '@/src/composition/clothingEngagement'
import ClotheCard from '@/src/presentation/components/clothes/ClotheCard'
import ClothesFilter from '@/src/presentation/components/clothes/ClothesFilter'
import { useClotheEngagement } from '@/src/presentation/hooks/clothes/useClotheEngagement'
import { usePaginatedClothes } from '@/src/presentation/hooks/clothes/usePaginatedClothes'
import { CLOTHES_CATEGORY_ALL } from '@/src/shared/constants/clothesCategories'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native'

export default function FavoriteScreen() {
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)
  const loadPage = useCallback(
    (pagination: Parameters<typeof clothingEngagementService.getMyFavoriteClothes>[0]) =>
      clothingEngagementService.getMyFavoriteClothes(pagination),
    [],
  )
  const {
    clothes,
    isRefreshing,
    isLoadingMore,
    initializeClothes,
    refreshClothes,
    loadMoreClothes,
  } = usePaginatedClothes(loadPage)
  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  useFocusEffect(
    useCallback(() => {
      void initializeClothes()
    }, [initializeClothes]),
  )

  const filteredClothes = clothes.filter(
    (item) => categoryFilter === CLOTHES_CATEGORY_ALL || item.category === categoryFilter,
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoris</Text>
        <Text style={styles.subtitle}>Tes vêtements en favoris.</Text>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      <FlatList
        data={filteredClothes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClotheCard item={item} {...getCardEngagementProps(item.id)} />}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={refreshClothes}
        onEndReached={loadMoreClothes}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.footerLoader} /> : null}
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
  footerLoader: {
    marginVertical: 16,
  },
})
