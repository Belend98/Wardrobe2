import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import ProfileCard from './ProfileCard'

type ProfileData = {
  username: string
  bio: string | null
  email: string | null
  createdAt: Date | null
}

type PersonalHeaderProps = {
  isLoading: boolean
  isSigningOut: boolean
  onSignOut: () => void
  profile: ProfileData | null
}

export default function PersonalHeader({
  isLoading,
  isSigningOut,
  onSignOut,
  profile,
}: PersonalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mon profil</Text>
        </View>
        <Pressable
          onPress={onSignOut}
          disabled={isSigningOut || isLoading}
          style={[styles.button, isSigningOut ? styles.buttonDisabled : undefined]}
        >
          <Text style={styles.buttonText}>{isSigningOut ? 'Deconnexion...' : 'Se deconnecter'}</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Consulte et gere tes informations personnelles.</Text>
      <ProfileCard profile={profile} />
      <View style={styles.quickActions}>
        <Pressable style={styles.friendsButton} onPress={() => router.push('/friends')}>
          <Text style={styles.friendsButtonText}>Amis</Text>
        </Pressable>
        <Pressable style={styles.clothesButton} onPress={() => router.push('/user/clothes')}>
          <Text style={styles.clothesButtonText}>Vetements</Text>
        </Pressable>
      </View>
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
  quickActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  friendsButton: {
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  friendsButtonText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 12,
  },
  clothesButton: {
    borderWidth: 1,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clothesButtonText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 12,
  },
})
