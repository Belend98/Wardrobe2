import { supabase } from '@/src/utils/supabase'

export type SearchedUser = {
  id: string
  username: string
  bio: string | null
}

export async function searchUserByUsername(rawUsername: string): Promise<SearchedUser | null> {
  const username = rawUsername.trim()

  if (!username) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username, bio')
    .ilike('username', username)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return {
    id: data.id as string,
    username: data.username as string,
    bio: (data.bio as string | null) ?? null,
  }
}
