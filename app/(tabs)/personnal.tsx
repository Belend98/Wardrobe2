import type { ClothesModel } from '@/shared/model/clothesModel'
import { signOut } from '@/src/features/auth/authService'
import ClotheCard from '@/src/features/clothes/component/ClotheCard'
import { CLOTHES_CATEGORIES, CLOTHES_CATEGORY_ALL } from '@/src/features/clothes/clothesCategories'
import { deleteMyClothe, getMyClothes } from '@/src/features/clothes/clothesService'
import { useClotheEngagement } from '@/src/features/clothes/hooks/useClotheEngagement'
import { deleteCurrentUserAccountData, getCurrentUserProfileOrThrow } from '@/src/features/user/userService'
import { router } from 'expo-router'
import React from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

export default function PersonnalScreen() {
  const { width } = useWindowDimensions()
  const gridColumns = width < 900 ? 1 : Math.max(4, Math.min(6, Math.floor((width - 40) / 170)))
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [clothes, setClothes] = React.useState<ClothesModel[]>([])
  const [categoryFilter, setCategoryFilter] = React.useState<string>(CLOTHES_CATEGORY_ALL)
  const { getCardEngagementProps } = useClotheEngagement(clothes, {
    onError: (message) => Alert.alert('Erreur', message),
  })
  const [profile, setProfile] = React.useState<{
    username: string
    bio: string | null
    email: string | null
    createdAt: Date | null
  } | null>(null)

  const loadMyClothes = React.useCallback(async () => {
    try {
      const data = await getMyClothes()
      setClothes(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    }
  }, [])

  const loadMyProfile = React.useCallback(async () => {
    try {
      const data = await getCurrentUserProfileOrThrow()
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

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await Promise.all([loadMyClothes(), loadMyProfile()])
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [loadMyClothes, loadMyProfile])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([loadMyClothes(), loadMyProfile()])
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.replace('/(auth)/signup')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de se deconnecter.'
      Alert.alert('Erreur', message)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleDeleteAccount = () => {
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
                await signOut()
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
  }

  const confirmDelete = (id: string) => {
    Alert.alert('Supprimer', 'Confirmer la suppression de ce vetement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(id)
            await deleteMyClothe(id)
            setClothes((prev) => prev.filter((item) => item.id !== id))
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Impossible de supprimer ce vetement.'
            Alert.alert('Erreur', message)
          } finally {
            setDeletingId(null)
          }
        },
      },
    ])
  }

  const renderItem = ({ item }: { item: ClothesModel }) => (
    <ClotheCard
      item={item}
      onDelete={confirmDelete}
      onEdit={(id) => router.push({ pathname: '/clothes/[id]/edit', params: { id } })}
      isDeleting={deletingId === item.id}
      {...getCardEngagementProps(item.id)}
    />
  )
  const filteredClothes = clothes.filter(
    (item) => categoryFilter === CLOTHES_CATEGORY_ALL || item.category === categoryFilter,
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Mes vetements</Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing || isLoading}
            style={[styles.refreshButton, isRefreshing ? styles.buttonDisabled : undefined]}
          >
            <Text style={styles.refreshButtonText}>
              {isRefreshing ? 'Rafraichissement...' : 'Rafraichir'}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={[styles.button, isSigningOut ? styles.buttonDisabled : undefined]}
          >
            <Text style={styles.buttonText}>
              {isSigningOut ? 'Deconnexion...' : 'Se deconnecter'}
            </Text>
          </Pressable>
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
        <Text style={styles.subtitle}>Tous tes vetements publies.</Text>
        <View style={styles.filterWrap}>
          {[CLOTHES_CATEGORY_ALL, ...CLOTHES_CATEGORIES].map((category) => {
            const selected = categoryFilter === category
            return (
              <Pressable
                key={category}
                onPress={() => setCategoryFilter(category)}
                style={[styles.filterChip, selected ? styles.filterChipActive : undefined]}
              >
                <Text style={[styles.filterChipText, selected ? styles.filterChipTextActive : undefined]}>
                  {category}
                </Text>
              </Pressable>
            )
          })}
        </View>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Mon profil</Text>
            <View style={styles.profileActions}>
              <Pressable style={styles.friendsButton} onPress={() => router.push('/friends')}>
                <Text style={styles.friendsButtonText}>Amis</Text>
              </Pressable>
              <Pressable style={styles.editProfileButton} onPress={() => router.push('/user/edit')}>
                <Text style={styles.editProfileButtonText}>Modifier</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.profileLine}>Pseudo: {profile?.username ?? '-'}</Text>
          <Text style={styles.profileLine}>Email: {profile?.email ?? '-'}</Text>
          <Text style={styles.profileLine}>Bio: {profile?.bio?.trim() ? profile.bio : '-'}</Text>
          <Text style={styles.profileLine}>
            Compte cree le:{' '}
            {profile?.createdAt ? profile.createdAt.toLocaleDateString('fr-BE') : '-'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          key={`personnal-grid-${gridColumns}`}
          data={filteredClothes}
          numColumns={gridColumns}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateText}>Tu n&apos;as pas encore publie de vetement.</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
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
  friendsButton: {
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  friendsButtonText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 12,
  },
  filterWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  filterChipText: {
    color: '#44403C',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#115E59',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  centerState: {
    padding: 24,
    alignItems: 'center',
  },
  stateText: {
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
    marginRight: 8,
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
