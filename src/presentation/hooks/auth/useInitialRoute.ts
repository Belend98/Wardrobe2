import { getMyProfile } from '@/src/application/services/userService'
import { supabase } from '@/src/infrastructure/supabase/client'
import { router } from 'expo-router'
import { useEffect } from 'react'

export function useInitialRoute() {
  useEffect(() => {
    const handleInitialRedirect = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          router.replace('/(auth)/signup')
          return
        }

        const profile = await getMyProfile(session.user.id)
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
