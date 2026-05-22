import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { ApplicationOut, Status } from '../api/types'
import { APPLICATION_TYPE_LABELS, STATUS_LABELS } from '../api/types'
import { formatLocalDate } from '../api/utils'

const STATUS_FILTERS: (Status | 'ALL')[] = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_MORE_INFORMATION',
  'APPROVED',
  'REJECTED',
]

const PAGE_SIZE = 10

function matchesSearch(app: ApplicationOut, q: string): boolean {
  if (!q) return true
  const term = q.toLowerCase()
  return (
    app.applicant_name.toLowerCase().includes(term) ||
    app.tracking_number.toLowerCase().includes(term) ||
    (app.company_name ?? '').toLowerCase().includes(term) ||
    app.applicant_email.toLowerCase().includes(term) ||
    APPLICATION_TYPE_LABELS[app.application_type].toLowerCase().includes(term) ||
    STATUS_LABELS[app.status].toLowerCase().includes(term)
  )
}

export default function AppList() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<ApplicationOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    setPage(0)
    api
      .listApplications(filter === 'ALL' ? undefined : { status: filter })
      .then((data) => {
        if (!cancelled) setApps(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  const filtered = useMemo(() => {
    if (!search) return apps
    return apps.filter((a) => matchesSearch(a, search))
  }, [apps, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageApps = useMemo(() => {
    const start = safePage * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  return (
    <div>
      <div className="ios-segmented">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`ios-segment ${filter === s ? 'ios-segment-active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="ios-search">
        <span className="ios-search-icon">&#x1F50D;</span>
        <input
          className="ios-search-input"
          placeholder="Search applications…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
        />
      </div>

      {loading && <div className="ios-spinner" />}

      {error && (
        <div className="ios-form-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="ios-empty">
          <p>{search ? 'No matching applications' : 'No applications found'}</p>
          {!search && (
            <button
              className="ios-btn ios-btn-primary"
              style={{ marginTop: 16, width: 'auto', padding: '0 32px' }}
              onClick={() => navigate('/applications/new')}
            >
              Create Application
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="ios-table-wrap">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Applicant</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {pageApps.map((app) => (
                  <tr
                    key={app.tracking_number}
                    onClick={() => navigate(`/applications/${app.tracking_number}`)}
                  >
                    <td className="tracking-cell">
                      #{app.tracking_number.slice(0, 8)}
                    </td>
                    <td className="app-name">{app.applicant_name}</td>
                    <td>{app.company_name || '—'}</td>
                    <td>{APPLICATION_TYPE_LABELS[app.application_type]}</td>
                    <td>
                      <span className={`ios-badge ios-badge-${app.status.toLowerCase()}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--ios-text-tertiary)', fontSize: 13 }}>
                      {formatLocalDate(app.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ios-pagination">
            <button
              className="ios-page-btn"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="ios-page-info">
              {filtered.length === 0
                ? '0 results'
                : `${safePage * PAGE_SIZE + 1}–${Math.min(
                    (safePage + 1) * PAGE_SIZE,
                    filtered.length
                  )} of ${filtered.length}`}
            </span>
            <button
              className="ios-page-btn"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
