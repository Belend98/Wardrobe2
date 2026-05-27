import PersonalHeader from '@/src/features/user/components/PersonalHeader'
import { usePersonalActions } from '@/src/features/user/hooks/usePersonalActions'
import { useUserProfile } from '@/src/features/user/hooks/useUserProfile'
import {useState, useEffect, useCallback} from 'react'
import { StyleSheet, View } from 'react-native'

export default function PersonnalScreen() {
  const { profile, isLoading: profileIsLoading, loadProfile, setIsLoading: setProfileIsLoading } = useUserProfile()
  const { isSigningOut, isDeletingAccount, handleSignOut, handleDeleteAccount } = usePersonalActions()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await loadProfile()
      } finally {
        if (mounted) setProfileIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [loadProfile, setProfileIsLoading])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setProfileIsLoading(true)
    try {
      await loadProfile()
    } finally {
      setProfileIsLoading(false)
      setIsRefreshing(false)
    }
  }, [loadProfile, setProfileIsLoading])

  return (
    <View style={styles.container}>
      <PersonalHeader
        isRefreshing={isRefreshing}
        isLoading={profileIsLoading}
        isSigningOut={isSigningOut}
        isDeletingAccount={isDeletingAccount}
        onRefresh={handleRefresh}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        profile={profile}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F4',
  },
})
