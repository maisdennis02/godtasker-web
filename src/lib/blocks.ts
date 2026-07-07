import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import { useAuth } from '../auth/AuthContext'
import type { User } from '../types'

// Shared query-key prefix so any mutation that changes who I block can
// invalidate every consumer (People, Chat, PersonProfile) in one place.
export const BLOCKS_KEY = ['me-blocks'] as const

// The set of emails the current user has blocked, read from their own record.
export function useBlockedEmails(): Set<string> {
  const { user } = useAuth()
  const { data } = useQuery({
    queryKey: [...BLOCKS_KEY, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await api.get(`/users/${user!.id}`)
      return (res.data as User).blocked_list ?? []
    },
  })
  return useMemo(() => new Set(data ?? []), [data])
}
