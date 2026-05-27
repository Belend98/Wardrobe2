import { addCommentToClothe, type ClotheCommentModel } from '@/src/features/clothes/clothesService'
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

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
  const [commentLoadingByClotheId, setCommentLoadingByClotheId] = useState<Record<string, boolean>>({})

  const addComment = useCallback(
    async (id: string, content: string) => {
      if (commentLoadingByClotheId[id]) return
      const trimmed = content.trim()
      if (!trimmed) {
        onError?.('Le commentaire ne peut pas etre vide.')
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
        onError?.(message)
      } finally {
        setCommentLoadingByClotheId((prev) => ({ ...prev, [id]: false }))
      }
    },
    [commentLoadingByClotheId, currentUserId, onError, setCommentsByClotheId],
  )

  return { commentsByClotheId, commentLoadingByClotheId, addComment }
}
