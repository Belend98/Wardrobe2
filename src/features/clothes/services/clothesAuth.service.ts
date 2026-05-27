import { supabase } from '@/src/utils/supabase'

export async function getCurrentUserIdOrThrow() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error('Utilisateur non connecte.')

  return user.id
}
