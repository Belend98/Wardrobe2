import { z } from 'zod'
import { CLOTHES_CATEGORIES } from '@/src/shared/constants/clothesCategories'

export const createClotheSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(80, 'Nom trop long'),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image obligatoire')
    .refine(
      (value) =>
        value.startsWith('http://') ||
        value.startsWith('blob:http://') ||
        value.startsWith('https://') ||
        value.startsWith('file://') ||
        value.startsWith('content://'),
      'URI image invalide',
    ),
  color: z.string().trim().max(40, 'Couleur trop longue').optional(),
  category: z.enum(CLOTHES_CATEGORIES, { message: 'Categorie invalide' }),
  description: z.string().trim().max(500, 'Description trop longue').optional(),
  isPublic: z.boolean(),
})

export type CreateClotheInput = z.infer<typeof createClotheSchema>
