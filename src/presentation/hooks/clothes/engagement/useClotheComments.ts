import { addCommentToClothe, type ClotheCommentModel } from '@/src/application/services/clothesService'
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

type UseClotheCommentsOptions = {
  onError?: (message: string) => void
  currentUserId: string | null
  commentsByClotheId: Record<string, ClotheCommentModel[]>
  setCommentsByClotheId: Dispatch<SetStateAction<Record<string, ClotheCommentModel[]>>>
}

export function useClotheComments({
  onError,
  currentUserId,
  commentsByClotheId,
  setCommentsByClotheId,
}: UseClotheCommentsOptions) {
  const onErrorRef = useRef(onError)
  const [commentLoadingByClotheId, setCommentLoadingByClotheId] = useState<Record<string, boolean>>({})

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const addComment = useCallback(
    async (id: string, content: string) => {
      if (commentLoadingByClotheId[id]) return
      const trimmed = content.trim()
      if (!trimmed) {
        onErrorRef.current?.('Le commentaire ne peut pas etre vide.')
        return
      }

      setCommentLoadingByClotheId((prev) => ({ ...prev, [id]: true }))
      try {
        const inserted = await addCommentToClothe(id, trimmed, currentUserId ?? undefined)
        setCommentsByClotheId((prev) => ({
          ...prev,
          [id]: [inserted, ...(prev[id] ?? [])],
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Impossible d ajouter le commentaire.'
        onErrorRef.current?.(message)
      } finally {
        setCommentLoadingByClotheId((prev) => ({ ...prev, [id]: false }))
      }
    },
    [commentLoadingByClotheId, currentUserId, setCommentsByClotheId],
  )

  return { commentsByClotheId, commentLoadingByClotheId, addComment }
}
