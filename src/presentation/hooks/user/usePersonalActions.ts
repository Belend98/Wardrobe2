import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { authService } from '@/src/composition/auth'
import { deleteCurrentUserAccountData } from '@/src/application/services/userService'

export function usePersonalActions() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true)
      await authService.signOut()
      router.replace('/(auth)/signup')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de se deconnecter.'
      Alert.alert('Erreur', message)
    } finally {
      setIsSigningOut(false)
    }
  }, [])

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est definitive et supprimera tes donnees (profil, vetements, amis). Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeletingAccount(true)
              await deleteCurrentUserAccountData()
              try {
                await authService.signOut()
              } catch {
                // La session peut deja etre invalide apres suppression dans auth.users.
              }
              Alert.alert('Compte supprime', 'Ton compte a ete supprime.')
              router.replace('/(auth)/signup')
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Impossible de supprimer le compte.'
              Alert.alert('Erreur', message)
            } finally {
              setIsDeletingAccount(false)
            }
          },
        },
      ],
    )
  }, [])

  return {
    isSigningOut,
    isDeletingAccount,
    handleSignOut,
    handleDeleteAccount,
  }
}
