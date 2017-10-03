import { Query } from '../types/utils'

export function getQueries (projectId: string): Query[] {
  const queries = JSON.parse(
    window.localStorage.getItem(`queries-${projectId}`),
  )

  return queries || []
}

export function saveQuery (query: Query, projectId: string): void {
  const existingQueries = JSON.parse(
    window.localStorage.getItem(`queries-${projectId}`),
  ) || []

  const queryAlreadySaved = existingQueries.some((q) => (
    q.query === query.query && q.variables === query.variables
  ))
  if (queryAlreadySaved) {
    return
  }

  const queries = [query, ...existingQueries]

  window.localStorage.setItem(`queries-${projectId}`, JSON.stringify(queries))
}
