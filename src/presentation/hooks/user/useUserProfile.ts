import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { userService } from '@/src/composition/user'

interface UserProfile {
  username: string
  bio: string | null
  email: string | null
  createdAt: Date | null
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const data = await userService.getCurrentUserProfileOrThrow()
      setProfile({
        username: data.username,
        bio: data.bio,
        email: data.email,
        createdAt: data.createdAt,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger le profil.'
      Alert.alert('Erreur', message)
    }
  }, [])

  return {
    profile,
    isLoading,
    loadProfile,
    setIsLoading,
  }
}
