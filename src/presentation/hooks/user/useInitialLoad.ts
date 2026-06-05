import { useEffect } from 'react';

export function useInitialLoad(
  loadClothes: () => Promise<void>,
  loadProfile: () => Promise<void>,
  setClothesIsLoading: (loading: boolean) => void,
  setProfileIsLoading: (loading: boolean) => void,
) {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await Promise.all([loadClothes(), loadProfile()])
      } finally {
        if (mounted) {
          setClothesIsLoading(false)
          setProfileIsLoading(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [loadClothes, loadProfile, setClothesIsLoading, setProfileIsLoading])
}
