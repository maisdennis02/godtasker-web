import type { User } from '../types'

// Deterministic avatar tint so each person keeps the same color across renders.
export const AVATAR_TINTS = [
  'bg-indigo-500/20 text-indigo-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-sky-500/20 text-sky-300',
  'bg-violet-500/20 text-violet-300',
]

export function displayName(u: User): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
  return u.user_name || full || `user #${u.id}`
}

export function initials(u: User): string {
  const name = displayName(u)
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-xl',
} as const

export function Avatar({
  user,
  size = 'md',
}: {
  user: User
  size?: keyof typeof SIZES
}) {
  const sizeClasses = SIZES[size]
  if (user.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt=""
        className={`${sizeClasses} shrink-0 rounded-full object-cover`}
      />
    )
  }
  const tint = AVATAR_TINTS[user.id % AVATAR_TINTS.length]
  return (
    <div
      className={`flex ${sizeClasses} shrink-0 items-center justify-center rounded-full font-semibold ${tint}`}
    >
      {initials(user)}
    </div>
  )
}
