import { Pressable, StyleSheet, Text, View } from 'react-native'

type ClotheEngagementBarProps = {
  clotheId: string
  likesCount: number
  isLikedByMe: boolean
  isFavoriteByMe: boolean
  isLikeLoading: boolean
  isFavoriteLoading: boolean
  onToggleLike?: (id: string, shouldLike: boolean) => void
  onToggleFavorite?: (id: string, shouldFavorite: boolean) => void
}

export default function ClotheEngagementBar({
  clotheId,
  likesCount,
  isLikedByMe,
  isFavoriteByMe,
  isLikeLoading,
  isFavoriteLoading,
  onToggleLike,
  onToggleFavorite,
}: ClotheEngagementBarProps) {
  return (
    <>
      <View style={styles.favoriteRow}>
        <Pressable
          onPress={() => onToggleFavorite?.(clotheId, !isFavoriteByMe)}
          disabled={!onToggleFavorite || isFavoriteLoading}
          style={[
            styles.favoriteButton,
            isFavoriteByMe ? styles.favoriteButtonActive : undefined,
            isFavoriteLoading ? styles.disabled : undefined,
          ]}
        >
          <Text style={[styles.favoriteText, isFavoriteByMe ? styles.favoriteTextActive : undefined]}>
            {isFavoriteByMe ? 'Retirer favori' : 'Ajouter favori'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.likeRow}>
        <Pressable
          onPress={() => onToggleLike?.(clotheId, !isLikedByMe)}
          disabled={!onToggleLike || isLikeLoading}
          style={[
            styles.likeButton,
            isLikedByMe ? styles.likeButtonActive : undefined,
            isLikeLoading ? styles.disabled : undefined,
          ]}
        >
          <Text style={[styles.likeText, isLikedByMe ? styles.likeTextActive : undefined]}>
            {isLikedByMe ? 'Unlike' : 'Like'}
          </Text>
        </Pressable>
        <Text style={styles.likesCountText}>
          {likesCount} {likesCount > 1 ? 'likes' : 'like'}
        </Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  favoriteRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  favoriteButton: {
    borderWidth: 1,
    borderColor: '#D6D3D1',
    backgroundColor: '#FAFAF9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  favoriteButtonActive: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
  },
  favoriteText: {
    color: '#292524',
    fontWeight: '700',
    fontSize: 11,
  },
  favoriteTextActive: {
    color: '#B45309',
  },
  likeRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeButton: {
    borderWidth: 1,
    borderColor: '#D6D3D1',
    backgroundColor: '#FAFAF9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  likeButtonActive: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  likeText: {
    color: '#292524',
    fontWeight: '700',
    fontSize: 11,
  },
  likeTextActive: {
    color: '#B91C1C',
  },
  likesCountText: {
    color: '#78716C',
    fontSize: 11,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
})
