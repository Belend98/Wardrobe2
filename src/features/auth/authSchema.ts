import { z } from 'zod'

export const signSchema = z.object({
  email: z.email('Adresse email invalide').trim(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
    .max(72, 'Le mot de passe est trop long'),
})

export type SignInput = z.infer<typeof signSchema>


