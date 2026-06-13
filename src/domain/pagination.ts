export type Pagination = {
  offset: number
  limit: number
}

export type PaginatedResult<T> = {
  items: T[]
  hasMore: boolean
}
