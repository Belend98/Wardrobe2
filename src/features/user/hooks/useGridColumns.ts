import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

export function useGridColumns() {
  const { width } = useWindowDimensions()
  
  const gridColumns = useMemo(() => {
    return width < 900 ? 1 : Math.max(4, Math.min(6, Math.floor((width - 40) / 170)))
  }, [width])

  return gridColumns
}
