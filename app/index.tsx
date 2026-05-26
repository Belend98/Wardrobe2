import { router } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { supabase } from '@/src/utils/supabase'
import { getMyProfile } from '@/src/features/user/userService'

export default function Index() {
  useEffect(() => {
    const resolveRoute = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/(auth)/signup')
        return
      }

      try {
        const profile = await getMyProfile(session.user.id)
        if (profile) {
          router.replace('/(tabs)/discover')
          return
        }
      } catch {
      }

      router.replace('/(auth)/profile')
    }

    void resolveRoute()
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  )
}
