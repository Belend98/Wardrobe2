import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type ProfileData = {
  username: string
  bio: string | null
  email: string | null
  createdAt: Date | null
}

type ProfileCardProps = {
  profile: ProfileData | null
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Mon profil</Text>
        <View style={styles.profileActions}>
          <Pressable style={styles.editProfileButton} onPress={() => router.push('/user/edit')}>
            <Text style={styles.editProfileButtonText}>Modifier</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.profileLine}>Pseudo: {profile?.username ?? '-'}</Text>
      <Text style={styles.profileLine}>Email: {profile?.email ?? '-'}</Text>
      <Text style={styles.profileLine}>Bio: {profile?.bio?.trim() ? profile.bio : '-'}</Text>
      <Text style={styles.profileLine}>
        Compte cree le: {profile?.createdAt ? profile.createdAt.toLocaleDateString('fr-BE') : '-'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  profileCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  profileLine: {
    color: '#374151',
    fontSize: 13,
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  editProfileButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
})
