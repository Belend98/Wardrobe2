import PersonalHeader from '@/src/presentation/components/user/PersonalHeader'
import { usePersonalActions } from '@/src/presentation/hooks/user/usePersonalActions'
import { useUserProfile } from '@/src/presentation/hooks/user/useUserProfile'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function PersonnalScreen() {
  const { profile, isLoading: profileIsLoading, loadProfile, setIsLoading: setProfileIsLoading } = useUserProfile()
  const { isSigningOut, isDeletingAccount, handleSignOut, handleDeleteAccount } = usePersonalActions()

  useFocusEffect(
    useCallback(() => {
      let active = true
      ;(async () => {
        setProfileIsLoading(true)
        try {
          await loadProfile()
        } finally {
          if (active) setProfileIsLoading(false)
        }
      })()

      return () => {
        active = false
      }
    }, [loadProfile, setProfileIsLoading]),
  )

  return (
    <View style={styles.container}>
      <View style={styles.content}>
      <PersonalHeader
        isLoading={profileIsLoading}
        isSigningOut={isSigningOut}
        onSignOut={handleSignOut}
        profile={profile}
      />
      </View>
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount}
          style={[styles.deleteAccountButton, isDeletingAccount ? styles.buttonDisabled : undefined]}
        >
          <Text style={styles.deleteAccountButtonText}>
            {isDeletingAccount ? 'Suppression...' : 'Supprimer compte'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F4',
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  deleteAccountButton: {
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B91C1C',
    paddingHorizontal: 14,
  },
  deleteAccountButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
