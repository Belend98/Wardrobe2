import { useCallback } from 'react'

export function usePersonalRefresh(
  loadClothes: () => Promise<void>,
  loadProfile: () => Promise<void>,
  setRefreshing: (refreshing: boolean) => void,
) {
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadClothes(), loadProfile()])
    } finally {
      setRefreshing(false)
    }
  }, [loadClothes, loadProfile, setRefreshing])

  return handleRefresh
}
