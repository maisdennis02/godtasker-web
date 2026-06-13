// Renders an API response: arrays of objects as a table, everything else as JSON.
import { formatDate, looksLikeDate } from '../lib/format'

function cell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (looksLikeDate(value)) return formatDate(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function DataResult({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null

  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(row => row && typeof row === 'object' && !Array.isArray(row))
  ) {
    const rows = data as Record<string, unknown>[]
    const columns = Array.from(
      rows.reduce<Set<string>>((set, row) => {
        Object.keys(row).forEach(k => set.add(k))
        return set
      }, new Set())
    )
    return (
      <div className="max-h-96 overflow-auto rounded-md border border-slate-800">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-slate-800 text-slate-300">
            <tr>
              {columns.map(c => (
                <th key={c} className="px-2 py-1.5 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-800">
                {columns.map(c => (
                  <td
                    key={c}
                    className="max-w-[260px] truncate px-2 py-1.5 text-slate-300"
                    title={cell(row[c])}
                  >
                    {cell(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <pre className="max-h-96 overflow-auto rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
