import { useState } from 'react'
import { Button, DetailRow } from './ui'
import type { Offering } from '../types'

// The full set of offering fields, shown when a card is expanded.
function OfferingDetails({ offering }: { offering: Offering }) {
  const creator = offering.creator
  const creatorLabel = creator
    ? creator.user_name ||
      [creator.first_name, creator.last_name].filter(Boolean).join(' ').trim() ||
      creator.email
    : null

  return (
    <div className="space-y-1 border-t border-slate-800 pt-2 text-xs">
      <DetailRow
        label="Price"
        value={offering.price != null ? `$${offering.price}` : null}
      />
      <DetailRow
        label="Tenure"
        value={
          offering.tenure != null && offering.tenure > 0
            ? `${offering.tenure} day${offering.tenure === 1 ? '' : 's'}`
            : null
        }
      />
      <DetailRow label="Creator" value={creatorLabel} />
      <DetailRow
        label="Photo confirmation"
        value={
          offering.confirm_photo_option != null
            ? offering.confirm_photo_option > 0
              ? 'Required'
              : 'Not required'
            : null
        }
      />
      <DetailRow
        label="Shown in profile"
        value={
          offering.display_in_profile != null
            ? offering.display_in_profile
              ? 'Yes'
              : 'No'
            : null
        }
      />
      <DetailRow label="Offering ID" value={`#${offering.id}`} />
      {Array.isArray(offering.sub_task_list) && offering.sub_task_list.length > 0 && (
        <div className="border-t border-slate-800 pt-2">
          <p className="mb-1 text-slate-500">Subtasks</p>
          <ul className="space-y-1">
            {offering.sub_task_list.map((s, i) => (
              <li key={s.id ?? i} className="flex gap-2 text-slate-300">
                <span className="text-slate-600">{i + 1}.</span>
                <span>{s.description || `Item ${i + 1}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Expandable offering card. Owners get Edit/Delete; browsers get Request —
// both are optional so the same card serves Offerings and PersonProfile.
export function OfferingCard({
  offering,
  onRequest,
  requesting,
  onEdit,
  editing,
  onDelete,
  deleting,
}: {
  offering: Offering
  onRequest?: () => void
  requesting?: boolean
  onEdit?: () => void
  editing?: boolean
  onDelete?: () => void
  deleting?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const steps = Array.isArray(offering.sub_task_list)
    ? offering.sub_task_list.length
    : 0

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="flex flex-col gap-1.5 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-sm font-medium text-slate-100">
            {offering.name || `Offering #${offering.id}`}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {offering.price != null && (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-medium text-emerald-300">
                ${offering.price}
              </span>
            )}
            <span
              className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </div>

        {offering.description && (
          <p
            className={`text-xs text-slate-400 ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}
          >
            {offering.description}
          </p>
        )}

        {!expanded && ((offering.tenure ?? 0) > 0 || steps > 0) && (
          <p className="flex gap-3 text-xs text-slate-500">
            {offering.tenure != null && offering.tenure > 0 && (
              <span>
                {offering.tenure} day{offering.tenure === 1 ? '' : 's'}
              </span>
            )}
            {steps > 0 && (
              <span>
                {steps} step{steps === 1 ? '' : 's'}
              </span>
            )}
          </p>
        )}
      </button>

      {expanded && <OfferingDetails offering={offering} />}

      {onRequest && (
        <Button className="mt-1 w-full" onClick={onRequest} disabled={requesting}>
          {requesting ? 'Requesting…' : 'Request'}
        </Button>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-1 flex gap-2">
          {onEdit && (
            <button
              className={`inline-flex flex-1 items-center justify-center rounded-md border px-2.5 py-1 text-sm font-medium transition ${
                editing
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                  : 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              onClick={onEdit}
            >
              {editing ? 'Editing…' : 'Edit'}
            </button>
          )}
          {onDelete && (
            <button
              className="inline-flex flex-1 items-center justify-center rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
