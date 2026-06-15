import ClothesFilter from '@/src/presentation/components/clothes/ClothesFilter'
import ClotheCard from '@/src/presentation/components/clothes/ClotheCard'
import { usePersonalClothesScreen } from '@/src/presentation/hooks/clothes/usePersonalClothesScreen'
import { FlatList, StyleSheet, Text, View } from 'react-native'

export default function PersonalClothesScreen() {
  const {
    clothes,
    isLoading,
    isRefreshing,
    deletingId,
    categoryFilter,
    setCategoryFilter,
    handleRefresh,
    confirmDelete,
    handleEdit,
    getCardEngagementProps,
  } = usePersonalClothesScreen()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mon dressing</Text>
          <View style={styles.headerActions}>
          </View>
        </View>
        <ClothesFilter categoryFilter={categoryFilter} onSelectCategory={setCategoryFilter} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={clothes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClotheCard
              item={item}
              onDelete={confirmDelete}
              onEdit={handleEdit}
              isDeleting={deletingId === item.id}
              {...getCardEngagementProps(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateText}>Tu n&apos;as pas encore publie de vetement.</Text>
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
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
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
