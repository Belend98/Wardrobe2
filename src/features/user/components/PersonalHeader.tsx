import { Pressable, StyleSheet, Text, View } from 'react-native'
import ProfileCard from './ProfileCard'

type ProfileData = {
  username: string
  bio: string | null
  email: string | null
  createdAt: Date | null
}

type PersonalHeaderProps = {
  isRefreshing: boolean
  isLoading: boolean
  isSigningOut: boolean
  isDeletingAccount: boolean
  onRefresh: () => void
  onSignOut: () => void
  onDeleteAccount: () => void
  profile: ProfileData | null
}

export default function PersonalHeader({
  isRefreshing,
  isLoading,
  isSigningOut,
  isDeletingAccount,
  onRefresh,
  onSignOut,
  onDeleteAccount,
  profile,
}: PersonalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mon profil</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={onRefresh}
            disabled={isRefreshing || isLoading}
            style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : undefined]}
          >
            <Text style={styles.refreshButtonText}>
              {isRefreshing ? 'Rafraichissement...' : 'Rafraichir'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onSignOut}
            disabled={isSigningOut}
            style={[styles.button, isSigningOut ? styles.buttonDisabled : undefined]}
          >
            <Text style={styles.buttonText}>{isSigningOut ? 'Deconnexion...' : 'Se deconnecter'}</Text>
          </Pressable>
          <Pressable
            onPress={onDeleteAccount}
            disabled={isDeletingAccount}
            style={[styles.deleteAccountButton, isDeletingAccount ? styles.buttonDisabled : undefined]}
          >
            <Text style={styles.deleteAccountButtonText}>
              {isDeletingAccount ? 'Suppression...' : 'Supprimer compte'}
            </Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.subtitle}>Consulte et gere tes informations personnelles.</Text>
      <ProfileCard profile={profile} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    minWidth: 200,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  button: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
  },
  refreshButton: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: '#111827',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deleteAccountButton: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B91C1C',
    paddingHorizontal: 12,
  },
  deleteAccountButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})
