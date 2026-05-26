import type { ClothesModel } from '@/shared/model/clothesModel'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

type ClotheCardProps = {
  item: ClothesModel
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  isDeleting?: boolean
}

export default function ClotheCard({ item, onDelete, onEdit, isDeleting = false }: ClotheCardProps) {
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
        <Text style={styles.cardMeta}>{item.isPublic ? 'Public' : 'Prive'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
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
    padding: 12,
    gap: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  cardMeta: {
    color: '#6B7280',
    fontSize: 13,
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
