import { clothingCrudService } from '@/src/composition/clothing'
import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import ClotheCard from '@/src/presentation/components/clothes/ClotheCard'
import ClothesFilter from '@/src/presentation/components/clothes/ClothesFilter'
import { useClotheEngagement } from '@/src/presentation/hooks/clothes/useClotheEngagement'
import { useClothes } from '@/src/presentation/hooks/clothes/useClothes'
import { CLOTHES_CATEGORY_ALL } from '@/src/shared/constants/clothesCategories'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'

export default function DiscoverScreen() {
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)
  const loadClothes = useCallback(() => clothingCrudService.getMyAndFriendsClothes(), [])
  const {
    clothes,
    isRefreshing,
    initializeClothes,
    refreshClothes,
  } = useClothes(loadClothes)
  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  useFocusEffect(
    useCallback(() => {
      void initializeClothes()
    }, [initializeClothes]),
  )

  const renderItem = ({ item }: { item: ClothesModel }) => (
    <ClotheCard item={item} {...getCardEngagementProps(item.id)} />
  )
  const filteredClothes = clothes.filter(
    (item) => categoryFilter === CLOTHES_CATEGORY_ALL || item.category === categoryFilter,
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Découvrir</Text>
        <Text style={styles.subtitle}>Vois tes vêtements et ceux de tes amis.</Text>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      <FlatList
        data={filteredClothes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={refreshClothes}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Aucun vêtement à afficher.</Text>
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
