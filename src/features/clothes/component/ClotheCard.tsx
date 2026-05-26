import type { ClothesModel } from '@/shared/model/clothesModel'
import ClotheEngagementBar from '@/src/features/clothes/component/ClotheEngagementBar'
import type { ClotheCommentModel } from '@/src/features/clothes/clothesService'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

type ClotheCardProps = {
  item: ClothesModel
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onToggleLike?: (id: string, shouldLike: boolean) => void
  onToggleFavorite?: (id: string, shouldFavorite: boolean) => void
  isLikedByMe?: boolean
  isFavoriteByMe?: boolean
  likesCount?: number
  isLikeLoading?: boolean
  isFavoriteLoading?: boolean
  commentsCount?: number
  comments?: ClotheCommentModel[]
  isCommentLoading?: boolean
  currentUserId?: string | null
  userNamesByUserId?: Record<string, string>
  onAddComment?: (id: string, content: string) => void
  isDeleting?: boolean
}

export default function ClotheCard({
  item,
  onDelete,
  onEdit,
  onToggleLike,
  onToggleFavorite,
  isLikedByMe = false,
  isFavoriteByMe = false,
  likesCount = 0,
  isLikeLoading = false,
  isFavoriteLoading = false,
  commentsCount = 0,
  comments = [],
  isCommentLoading = false,
  currentUserId = null,
  userNamesByUserId = {},
  onAddComment,
  isDeleting = false,
}: ClotheCardProps) {
  const [imageError, setImageError] = React.useState(false)

  return (
    <View style={styles.card}>
      {imageError ? (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackText}>Image indisponible</Text>
        </View>
      ) : (
        <Image source={{ uri: item.imageUrl }} style={styles.image} onError={() => setImageError(true)} />
      )}

      <View style={styles.cardContent}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.actionsRow}>
            {onEdit ? (
              <Pressable onPress={() => onEdit(item.id)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable
                onPress={() => onDelete(item.id)}
                disabled={isDeleting}
                style={[styles.deleteButton, isDeleting ? styles.deleteButtonDisabled : undefined]}
              >
                <Text style={styles.deleteButtonText}>{isDeleting ? 'Suppression...' : 'Supprimer'}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        {item.color ? <Text style={styles.cardMeta}>Couleur: {item.color}</Text> : null}
        {item.category ? <Text style={styles.cardMeta}>Categorie: {item.category}</Text> : null}
        <Text style={styles.cardMeta}>{item.isPublic ? 'Public' : 'Prive'}</Text>
        <ClotheEngagementBar
          clotheId={item.id}
          likesCount={likesCount}
          isLikedByMe={isLikedByMe}
          isFavoriteByMe={isFavoriteByMe}
          isLikeLoading={isLikeLoading}
          isFavoriteLoading={isFavoriteLoading}
          commentsCount={commentsCount}
          comments={comments}
          isCommentLoading={isCommentLoading}
          currentUserId={currentUserId}
          userNamesByUserId={userNamesByUserId}
          onToggleLike={onToggleLike}
          onToggleFavorite={onToggleFavorite}
          onAddComment={onAddComment}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFEFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  cardContent: {
    padding: 10,
    gap: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  cardMeta: {
    color: '#78716C',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 12,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  editButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
})
