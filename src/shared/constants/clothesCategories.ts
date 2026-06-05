export const CLOTHES_CATEGORIES = [
  'T-shirt',
  'Pantalon',
  'Chaussures',
  'Veste',
  'Robe',
  'Accessoire',
  'Autre',
] as const

export type ClothesCategory = (typeof CLOTHES_CATEGORIES)[number]

export const CLOTHES_CATEGORY_ALL = 'Tous'
