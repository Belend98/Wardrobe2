import { CLOTHES_CATEGORIES, CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type ClothesFilterProps = {
  categoryFilter: string
  onSelectCategory: (category: string) => void
}

export default function ClothesFilter({ categoryFilter, onSelectCategory }: ClothesFilterProps) {
  return (
    <View style={styles.filterWrap}>
      {[CLOTHES_CATEGORY_ALL, ...CLOTHES_CATEGORIES].map((category) => {
        const selected = categoryFilter === category
        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[styles.filterChip, selected ? styles.filterChipActive : undefined]}
          >
            <Text style={[styles.filterChipText, selected ? styles.filterChipTextActive : undefined]}>
              {category}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  filterWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  filterChipText: {
    color: '#44403C',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#115E59',
  },
})
