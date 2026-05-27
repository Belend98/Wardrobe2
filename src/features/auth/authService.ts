import { supabase } from '@/src/utils/supabase'

function isMissingSessionError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error ? String(error.message ?? '') : ''
  return message.toLowerCase().includes('auth session missing')
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error && !isMissingSessionError(error)) {
    throw error
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}
