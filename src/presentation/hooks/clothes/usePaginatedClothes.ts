import type { ClothesModel } from '@/src/domain/entities/ClothingItem'
import type { PaginatedResult, Pagination } from '@/src/domain/pagination'
import { CLOTHES_PAGE_SIZE } from '@/src/shared/constants/pagination'
import { CLOTHES_STALE_TIME_MS } from '@/src/shared/constants/clothesRefresh'
import { useCallback, useRef, useState } from 'react'
import { Alert } from 'react-native'

type LoadClothesPage = (pagination: Pagination) => Promise<PaginatedResult<ClothesModel>>

export function usePaginatedClothes(loadPage: LoadClothesPage) {
  const [clothes, setClothes] = useState<ClothesModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const clothesRef = useRef<ClothesModel[]>([])
  const nextOffsetRef = useRef(0)
  const hasMoreRef = useRef(true)
  const isBusyRef = useRef(false)
  const lastLoadedAt = useRef(0)

  const replaceClothes = useCallback((items: ClothesModel[]) => {
    clothesRef.current = items
    setClothes(items)
  }, [])

  const loadFirstPage = useCallback(async () => {
    if (isBusyRef.current) return
    isBusyRef.current = true
    try {
      const page = await loadPage({ offset: 0, limit: CLOTHES_PAGE_SIZE })
      replaceClothes(page.items)
      nextOffsetRef.current = CLOTHES_PAGE_SIZE
      hasMoreRef.current = page.hasMore
      setHasMore(page.hasMore)
      lastLoadedAt.current = Date.now()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les vetements.'
      Alert.alert('Erreur', message)
    } finally {
      isBusyRef.current = false
    }
  }, [loadPage, replaceClothes])

  const initializeClothes = useCallback(async () => {
    const isStale = Date.now() - lastLoadedAt.current >= CLOTHES_STALE_TIME_MS
    if (isStale) await loadFirstPage()
    setIsLoading(false)
  }, [loadFirstPage])

  const refreshClothes = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await loadFirstPage()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadFirstPage])

  const loadMoreClothes = useCallback(async () => {
    if (isBusyRef.current || !hasMoreRef.current) return
    isBusyRef.current = true
    setIsLoadingMore(true)
    try {
      const page = await loadPage({
        offset: nextOffsetRef.current,
        limit: CLOTHES_PAGE_SIZE,
      })
      const knownIds = new Set(clothesRef.current.map((item) => item.id))
      const nextClothes = [
        ...clothesRef.current,
        ...page.items.filter((item) => !knownIds.has(item.id)),
      ]
      replaceClothes(nextClothes)
      nextOffsetRef.current += CLOTHES_PAGE_SIZE
      hasMoreRef.current = page.hasMore
      setHasMore(page.hasMore)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger plus de vetements.'
      Alert.alert('Erreur', message)
    } finally {
      isBusyRef.current = false
      setIsLoadingMore(false)
    }
  }, [loadPage, replaceClothes])

  const removeClothe = useCallback((id: string) => {
    replaceClothes(clothesRef.current.filter((item) => item.id !== id))
  }, [replaceClothes])

  return {
    clothes,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    initializeClothes,
    refreshClothes,
    loadMoreClothes,
    removeClothe,
  }
}
