import type { ClothesModel } from '@/shared/model/clothesModel'
import ClothesFilter from '@/shared/components/ClothesFilter'
import ClotheCard from '@/src/features/clothes/component/ClotheCard'
import { CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { getMyAndFriendsClothes } from '@/src/features/clothes/clothesService'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'

export default function DiscoverScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [clothes, setClothes] = useState<ClothesModel[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)
  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  const loadClothes = useCallback(async () => {
    try {
      const data = await getMyAndFriendsClothes()
      setClothes(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    }
  }, [])

  useEffect(() => {
    void loadClothes()
  }, [loadClothes])

  useFocusEffect(
    useCallback(() => {
      void loadClothes()
      return undefined
    }, [loadClothes]),
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadClothes()
    } finally {
      setIsRefreshing(false)
    }
  }

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
        <Text style={styles.subtitle}>Vois tes vétements et ceux de tes amis.</Text>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      <FlatList
        data={filteredClothes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Aucun vêtements à afficher.</Text>
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
