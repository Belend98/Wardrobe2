import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import ClotheCard from '@/src/presentation/components/clothes/ClotheCard'
import type { ComponentProps } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

type ClotheCardEngagementProps = Pick<
  ComponentProps<typeof ClotheCard>,
  | 'likesCount'
  | 'isLikedByMe'
  | 'isLikeLoading'
  | 'isFavoriteByMe'
  | 'isFavoriteLoading'
  | 'comments'
  | 'commentsCount'
  | 'isCommentLoading'
  | 'currentUserId'
  | 'userNamesByUserId'
  | 'onToggleLike'
  | 'onToggleFavorite'
  | 'onAddComment'
>

type ClothesGridProps = {
  isLoading: boolean
  isRefreshing: boolean
  clothes: ClothesModel[]
  deletingId: string | null
  onRefresh: () => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  getCardEngagementProps: (id: string) => ClotheCardEngagementProps
}

export default function ClothesGrid({
  isLoading,
  isRefreshing,
  clothes,
  deletingId,
  onRefresh,
  onDelete,
  onEdit,
  getCardEngagementProps,
}: ClothesGridProps) {
  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={clothes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ClotheCard
          item={item}
          onDelete={onDelete}
          onEdit={onEdit}
          isDeleting={deletingId === item.id}
          {...getCardEngagementProps(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <View style={styles.centerState}>
          <Text style={styles.stateText}>Tu n&apos;as pas encore publie de vetement.</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
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
