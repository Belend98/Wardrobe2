import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { searchUserByUsername, type SearchedUser } from './searchService'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Erreur pendant la recherche.'
}

export default function FriendsScreen() {
  const [query, setQuery] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [result, setResult] = React.useState<SearchedUser | null>(null)
  const [searchDone, setSearchDone] = React.useState(false)
  const [errorText, setErrorText] = React.useState<string | null>(null)

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
      setErrorText(getErrorMessage(error))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
        <Text style={styles.sectionTitle}>Resultat</Text>
        {result ? (
          <View style={styles.userCard}>
            <Text style={styles.username}>@{result.username}</Text>
            <Text style={styles.bio}>{result.bio?.trim() ? result.bio : 'Aucune bio'}</Text>
          </View>
        ) : searchDone ? (
          <Text style={styles.emptyText}>Aucun utilisateur trouve.</Text>
        ) : (
          <Text style={styles.emptyText}>Lance une recherche.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes amis</Text>
        <Text style={styles.emptyText}>Ami(s) a afficher ici a la prochaine etape.</Text>
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
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
  errorText: {
    marginTop: 8,
    color: '#B91C1C',
  },
})
