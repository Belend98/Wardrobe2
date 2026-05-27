import ClothesFilter from '@/shared/components/ClothesFilter'
import ClothesGrid from '@/src/features/clothes/component/ClothesGrid'
import { usePersonalClothesScreen } from '@/src/features/clothes/hooks/usePersonalClothesScreen'
import { Pressable, StyleSheet, Text, View } from 'react-native'

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
    handleBack,
    handleEdit,
    getCardEngagementProps,
  } = usePersonalClothesScreen()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mes vetements</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.backButton} onPress={handleBack}>
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
        clothes={clothes}
        deletingId={deletingId}
        onRefresh={handleRefresh}
        onDelete={confirmDelete}
        onEdit={handleEdit}
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
