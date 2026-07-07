import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { BLOCKS_KEY } from '../lib/blocks'
import { ConfirmDialog } from './ConfirmDialog'
import type { User } from '../types'

type Confirming = 'block' | 'unblock' | 'report' | null

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-3 py-1.5 text-left text-sm transition hover:bg-slate-800 ${
        danger ? 'text-rose-300' : 'text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function targetName(u: User): string {
  return (
    u.user_name ||
    [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
    u.email
  )
}

// Overflow ("⋯") menu exposing Block / Unblock / Report for another user.
// Owns its own mutations + confirmation dialogs so any surface (People cards,
// PersonProfile header) can drop it in and stay in sync via shared query keys.
export function UserActionsMenu({
  target,
  blocked,
  className = '',
}: {
  target: User
  blocked: boolean
  className?: string
}) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<Confirming>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const alreadyReported =
    !!user?.email && (target.flagged_list ?? []).includes(user.email)

  // Close the menu when clicking outside it.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['people'] })
    qc.invalidateQueries({ queryKey: ['person'] })
    qc.invalidateQueries({ queryKey: BLOCKS_KEY })
    qc.invalidateQueries({ queryKey: ['conversations'] })
  }

  const block = useMutation({
    mutationFn: async () => {
      await api.put('/users/block', {
        email: user?.email,
        blocker_email: target.email,
      })
    },
    onSuccess: () => {
      invalidate()
      setConfirming(null)
    },
  })

  const unblock = useMutation({
    mutationFn: async () => {
      await api.put('/users/unblock', {
        email: user?.email,
        unblocker_email: target.email,
      })
    },
    onSuccess: () => {
      invalidate()
      setConfirming(null)
    },
  })

  const report = useMutation({
    mutationFn: async () => {
      await api.put('/users/flag', {
        email: target.email,
        flagger_email: user?.email,
      })
    },
    onSuccess: () => {
      invalidate()
      setConfirming(null)
    },
  })

  const name = targetName(target)

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
      >
        ⋯
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-slate-700 bg-slate-900 py-1 shadow-xl"
        >
          {blocked ? (
            <MenuItem
              onClick={() => {
                setOpen(false)
                setConfirming('unblock')
              }}
            >
              Unblock
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                setOpen(false)
                setConfirming('block')
              }}
            >
              Block
            </MenuItem>
          )}
          {alreadyReported ? (
            <span className="block px-3 py-1.5 text-sm text-slate-600">
              Reported ✓
            </span>
          ) : (
            <MenuItem
              danger
              onClick={() => {
                setOpen(false)
                setConfirming('report')
              }}
            >
              Report
            </MenuItem>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirming === 'block'}
        title={`Block ${name}?`}
        message="They'll be hidden from your People list and conversations. You can unblock them anytime."
        confirmLabel="Block"
        tone="danger"
        pending={block.isPending}
        error={block.error ? (block.error as Error).message : undefined}
        onConfirm={() => block.mutate()}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmDialog
        open={confirming === 'unblock'}
        title={`Unblock ${name}?`}
        message="They'll show up in your lists again."
        confirmLabel="Unblock"
        pending={unblock.isPending}
        error={unblock.error ? (unblock.error as Error).message : undefined}
        onConfirm={() => unblock.mutate()}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmDialog
        open={confirming === 'report'}
        title={`Report ${name}?`}
        message="This flags the account for moderator review. Use it for spam, abuse, or inappropriate behavior."
        confirmLabel="Report"
        tone="danger"
        pending={report.isPending}
        error={report.error ? (report.error as Error).message : undefined}
        onConfirm={() => report.mutate()}
        onCancel={() => setConfirming(null)}
      />
    </div>
  )
}
