import { toErrorMessage } from '@/src/shared/utils/errors'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  getMyFriends,
  getReceivedFriendRequests,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
  type FriendItem,
  type ReceivedFriendRequest,
} from '@/src/application/services/friendrequestService'
import { searchUserByUsername, type SearchedUser } from '@/src/application/services/searchService'

export default function FriendsScreen() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchedUser | null>(null)
  const [searchDone, setSearchDone] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [receivedRequests, setReceivedRequests] = useState<ReceivedFriendRequest[]>([])
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [isLoadingFriends, setIsLoadingFriends] = useState(true)
  const [friends, setFriends] = useState<FriendItem[]>([])
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null)
  const [isRefreshingScreen, setIsRefreshingScreen] = useState(false)

  const loadReceivedRequests = useCallback(async () => {
    try {
      setIsLoadingRequests(true)
      const data = await getReceivedFriendRequests()
      setReceivedRequests(data)
    } catch (error) {
      setErrorText(toErrorMessage(error, 'Erreur pendant la recherche.'))
    } finally {
      setIsLoadingRequests(false)
    }
  }, [])

  useEffect(() => {
    void loadReceivedRequests()
  }, [loadReceivedRequests])

  const loadMyFriends = useCallback(async () => {
    try {
      setIsLoadingFriends(true)
      const data = await getMyFriends()
      setFriends(data)
    } catch (error) {
      setErrorText(toErrorMessage(error, 'Erreur pendant la recherche.'))
    } finally {
      setIsLoadingFriends(false)
    }
  }, [])

  useEffect(() => {
    void loadMyFriends()
  }, [loadMyFriends])

  const handleRefreshScreen = useCallback(async () => {
    setIsRefreshingScreen(true)
    setErrorText(null)
    try {
      await Promise.all([loadReceivedRequests(), loadMyFriends()])
    } finally {
      setIsRefreshingScreen(false)
    }
  }, [loadMyFriends, loadReceivedRequests])

  const handleSearch = async () => {
    setErrorText(null)
    setSearchDone(false)
    setResult(null)

    if (!query.trim()) {
      return
    }

    try {
      setIsSearching(true)
      const foundUser = await searchUserByUsername(query)
      setResult(foundUser)
      setSearchDone(true)
    } catch (error) {
      setErrorText(toErrorMessage(error, 'Erreur pendant la recherche.'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async () => {
    if (!result) return

    try {
      setIsSendingRequest(true)
      await sendFriendRequest(result.id)
      Alert.alert('Succes', `Demande envoyee a @${result.username}.`)
    } catch (error) {
      setErrorText(toErrorMessage(error, 'Erreur pendant la recherche.'))
    } finally {
      setIsSendingRequest(false)
    }
  }

  const handleRespond = async (requestId: string, decision: 'accepted' | 'rejected') => {
    try {
      setPendingActionId(requestId)
      await respondToFriendRequest(requestId, decision)
      setReceivedRequests((prev) => prev.filter((request) => request.id !== requestId))
      if (decision === 'accepted') {
        await loadMyFriends()
      }
      Alert.alert('Succes', decision === 'accepted' ? 'Demande acceptée.' : 'Demande rejetée.')
    } catch (error) {
      setErrorText(toErrorMessage(error, 'Erreur pendant la recherche.'))
    } finally {
      setPendingActionId(null)
    }
  }

  const handleRemoveFriend = (friend: FriendItem) => {
    Alert.alert('Retirer cet ami', `Supprimer @${friend.username} de tes amis ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            setRemovingFriendId(friend.id)
            await removeFriend(friend.id)
            setFriends((prev) => prev.filter((item) => item.id !== friend.id))
            Alert.alert('Succes', 'Ami supprime.')
          } catch (error) {
            setErrorText(toErrorMessage(error, 'Erreur pendant la recherche.'))
          } finally {
            setRemovingFriendId(null)
          }
        },
      },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshingScreen} onRefresh={handleRefreshScreen} />
      }
    >
      <Text style={styles.title}>Amis</Text>
      <Text style={styles.subtitle}>Recherche un utilisateur par son nom.</Text>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Pressable
          onPress={handleSearch}
          disabled={isSearching}
          style={[styles.searchButton, isSearching ? styles.buttonDisabled : undefined]}
        >
          <Text style={styles.searchButtonText}>{isSearching ? '...' : 'Rechercher'}</Text>
        </Pressable>
      </View>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandes reçues</Text>
        {isLoadingRequests ? (
          <Text style={styles.emptyText}>Chargement...</Text>
        ) : receivedRequests.length === 0 ? (
          <Text style={styles.emptyText}>Aucune demande en attente.</Text>
        ) : (
          receivedRequests.map((request) => {
            const isPendingAction = pendingActionId === request.id
            return (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.username}>@{request.senderUsername}</Text>
                <Text style={styles.bio}>
                  {request.senderBio?.trim() ? request.senderBio : 'Aucune bio'}
                </Text>
                <View style={styles.requestActions}>
                  <Pressable
                    onPress={() => handleRespond(request.id, 'accepted')}
                    disabled={isPendingAction}
                    style={[styles.acceptButton, isPendingAction ? styles.buttonDisabled : undefined]}
                  >
                    <Text style={styles.acceptButtonText}>
                      {isPendingAction ? '...' : 'Accepter'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRespond(request.id, 'rejected')}
                    disabled={isPendingAction}
                    style={[styles.rejectButton, isPendingAction ? styles.buttonDisabled : undefined]}
                  >
                    <Text style={styles.rejectButtonText}>
                      {isPendingAction ? '...' : 'Refuser'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resultat</Text>
        {result ? (
          <View style={styles.userCard}>
            <Text style={styles.username}>@{result.username}</Text>
            <Text style={styles.bio}>{result.bio?.trim() ? result.bio : 'Aucune bio'}</Text>
            <Text style={styles.actionLabel}>Action</Text>
            <Pressable
              onPress={handleSendRequest}
              disabled={isSendingRequest}
              style={[styles.addButton, isSendingRequest ? styles.buttonDisabled : undefined]}
            >
              <Text style={styles.addButtonText}>
                {isSendingRequest ? 'Envoi en cours...' : 'Ajouter cet utilisateur'}
              </Text>
            </Pressable>
          </View>
        ) : searchDone ? (
          <Text style={styles.emptyText}>Aucun utilisateur trouve.</Text>
        ) : (
          <Text style={styles.emptyText}>Lance une recherche.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes amis</Text>
        {isLoadingFriends ? (
          <Text style={styles.emptyText}>Chargement...</Text>
        ) : friends.length === 0 ? (
          <Text style={styles.emptyText}>Tu n&apos;as pas encore d&apos;amis.</Text>
        ) : (
          friends.map((friend) => (
            <View key={friend.id} style={styles.friendCard}>
              <Text style={styles.username}>@{friend.username}</Text>
              <Text style={styles.bio}>{friend.bio?.trim() ? friend.bio : 'Aucune bio'}</Text>
              <Pressable
                onPress={() => handleRemoveFriend(friend)}
                disabled={removingFriendId === friend.id}
                style={[
                  styles.removeFriendButton,
                  removingFriendId === friend.id ? styles.buttonDisabled : undefined,
                ]}
              >
                <Text style={styles.removeFriendButtonText}>
                  {removingFriendId === friend.id ? 'Suppression...' : 'Supprimer cet ami'}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 16,
    color: '#4B5563',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchButton: {
    borderRadius: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  section: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userCard: {
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    gap: 4,
  },
  username: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
  bio: {
    color: '#374151',
    fontSize: 13,
  },
  requestCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 6,
  },
  friendCard: {
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    gap: 4,
  },
  removeFriendButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFriendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  requestActions: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#166534',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  rejectButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionLabel: {
    marginTop: 8,
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#166534',
    height: 38,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
  errorText: {
    marginTop: 8,
    color: '#B91C1C',
  },
})
