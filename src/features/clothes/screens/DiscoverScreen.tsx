import type { ClothesModel } from '@/shared/model/clothesModel'
import ClothesFilter from '@/shared/components/ClothesFilter'
import ClotheCard from '@/src/features/clothes/component/ClotheCard'
import { CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { getMyAndFriendsClothes, getUsernamesByUserIds } from '@/src/features/clothes/clothesService'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import {
  hydrateDiscoverClothesCache,
  persistDiscoverClothesCache,
} from '@/src/features/clothes/services/clothesLists.cache'
import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'

export default function DiscoverScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [clothes, setClothes] = useState<ClothesModel[]>([])
  const [ownerNamesByUserId, setOwnerNamesByUserId] = useState<Record<string, string>>({})
  const [categoryFilter, setCategoryFilter] = useState<string>(CLOTHES_CATEGORY_ALL)
  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })

  const loadClothes = useCallback(async () => {
    try {
      const data = await getMyAndFriendsClothes()
      setClothes(data)
      const ownerNames = await getUsernamesByUserIds(data.map((item) => item.userId))
      setOwnerNamesByUserId(ownerNames)
      await persistDiscoverClothesCache(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      const hydrated = await hydrateDiscoverClothesCache()
      if (active && hydrated && hydrated.length > 0) {
        setClothes(hydrated)
      }
      await loadClothes()
    })()

    return () => {
      active = false
    }
  }, [loadClothes])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadClothes()
    } finally {
      setIsRefreshing(false)
    }
  }

  const renderItem = ({ item }: { item: ClothesModel }) => (
    <ClotheCard
      item={item}
      ownerName={ownerNamesByUserId[item.userId] ?? 'Utilisateur'}
      {...getCardEngagementProps(item.id)}
    />
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
