import { authService } from '@/src/composition/auth'
import { userService } from '@/src/composition/user'
import { router } from 'expo-router'
import { useEffect } from 'react'

export function useInitialRoute() {
  useEffect(() => {
    const handleInitialRedirect = async () => {
      try {
        const user = await authService.getCurrentUser()

        if (!user) {
          router.replace('/(auth)/signup')
          return
        }

        const profile = await userService.getMyProfile(user.id)
        if (profile) {
          router.replace('/(tabs)/discover')
        } else {
          router.replace('/(auth)/profile')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        router.replace('/(auth)/signup')
      }
    }

    void handleInitialRedirect()
  }, [])
}
