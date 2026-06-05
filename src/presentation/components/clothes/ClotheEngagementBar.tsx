import type { ClotheCommentModel } from '@/src/application/services/clothesService'
import { useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type ClotheEngagementBarProps = {
  clotheId: string
  likesCount: number
  isLikedByMe: boolean
  isFavoriteByMe: boolean
  isLikeLoading: boolean
  isFavoriteLoading: boolean
  commentsCount: number
  comments: ClotheCommentModel[]
  isCommentLoading: boolean
  currentUserId?: string | null
  userNamesByUserId?: Record<string, string>
  onToggleLike?: (id: string, shouldLike: boolean) => void
  onToggleFavorite?: (id: string, shouldFavorite: boolean) => void
  onAddComment?: (id: string, content: string) => void
}

export default function ClotheEngagementBar({
  clotheId,
  likesCount,
  isLikedByMe,
  isFavoriteByMe,
  isLikeLoading,
  isFavoriteLoading,
  commentsCount,
  comments,
  isCommentLoading,
  currentUserId,
  userNamesByUserId = {},
  onToggleLike,
  onToggleFavorite,
  onAddComment,
}: ClotheEngagementBarProps) {
  const [draftComment, setDraftComment] = useState('')
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const previewComments = comments.slice(0, 3)

  const handleSendComment = () => {
    const content = draftComment.trim()
    if (!content || !onAddComment) return
    onAddComment(clotheId, content)
    setDraftComment('')
  }

  return (
    <>
      <Pressable onPress={() => setIsCommentsModalOpen(true)} style={styles.commentsCountButton}>
        <Text style={styles.commentsCountText}>
          {commentsCount} {commentsCount > 1 ? 'commentaires' : 'commentaire'}
        </Text>
      </Pressable>
      <FlatList
        data={previewComments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.commentText} numberOfLines={2}>
            {item.userId === currentUserId
              ? userNamesByUserId[item.userId] ?? 'Moi'
              : userNamesByUserId[item.userId] ?? 'Utilisateur'}
            : {item.content}
          </Text>
        )}
        scrollEnabled={false}
        style={styles.commentsList}
        contentContainerStyle={styles.commentsListContent}
        ListEmptyComponent={<Text style={styles.commentEmpty}>Aucun commentaire.</Text>}
      />
      <View style={styles.commentInputRow}>
        <TextInput
          value={draftComment}
          onChangeText={setDraftComment}
          placeholder="Commenter..."
          style={styles.commentInput}
          editable={!isCommentLoading}
          maxLength={180}
        />
        <Pressable
          onPress={handleSendComment}
          disabled={isCommentLoading || !draftComment.trim() || !onAddComment}
          style={[styles.commentButton, (isCommentLoading || !draftComment.trim()) ? styles.disabled : undefined]}
        >
          <Text style={styles.commentButtonText}>{isCommentLoading ? '...' : 'OK'}</Text>
        </Pressable>
      </View>

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

      <Modal
        visible={isCommentsModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCommentsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Commentaires</Text>
              <Pressable onPress={() => setIsCommentsModalOpen(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>Fermer</Text>
              </Pressable>
            </View>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Text style={styles.modalCommentText}>
                  {item.userId === currentUserId
                    ? userNamesByUserId[item.userId] ?? 'Moi'
                    : userNamesByUserId[item.userId] ?? 'Utilisateur'}
                  : {item.content}
                </Text>
              )}
              contentContainerStyle={styles.modalListContent}
              ListEmptyComponent={<Text style={styles.commentEmpty}>Aucun commentaire.</Text>}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
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
  commentsCountButton: {
    alignSelf: 'flex-start',
  },
  commentsCountText: {
    marginTop: 6,
    color: '#57534E',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  commentText: {
    marginTop: 1,
    color: '#44403C',
    fontSize: 11,
  },
  commentsList: {
    marginTop: 3,
    minHeight: 42,
  },
  commentsListContent: {
    gap: 2,
  },
  commentEmpty: {
    color: '#A8A29E',
    fontSize: 11,
    fontStyle: 'italic',
  },
  commentInputRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    backgroundColor: '#FAFAF9',
  },
  commentButton: {
    borderRadius: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  commentButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  disabled: {
    opacity: 0.6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalCloseButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  modalList: {
    flexGrow: 0,
  },
  modalListContent: {
    gap: 6,
  },
  modalCommentText: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 18,
  },
})
