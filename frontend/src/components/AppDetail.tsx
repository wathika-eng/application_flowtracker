import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { ApplicationOut, Status } from '../api/types'
import { APPLICATION_TYPE_LABELS, STATUS_LABELS } from '../api/types'
import { formatLocalDateTime } from '../api/utils'
import Toast from './Toast'

type Action =
  | { label: string; type: 'primary' | 'destructive' | 'default'; action: () => Promise<void>; visible: boolean }

export default function AppDetail() {
  const { tracking_number } = useParams()
  const navigate = useNavigate()

  const [app, setApp] = useState<ApplicationOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!tracking_number) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    api
      .getApplication(tracking_number)
      .then((data) => {
        if (!cancelled) setApp(data)
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
  }, [tracking_number])

  async function handleSubmit() {
    if (!tracking_number) return
    setSubmitting(true)
    try {
      const updated = await api.submitApplication(tracking_number)
      setApp(updated)
      setToast('Application submitted for review')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStartReview() {
    if (!tracking_number) return
    navigate(`/applications/${tracking_number}/review`)
  }

  async function handleRequestInfo() {
    if (!tracking_number) return
    navigate(`/applications/${tracking_number}/decision`)
  }

  async function handleDecision() {
    if (!tracking_number) return
    navigate(`/applications/${tracking_number}/decision`)
  }

  function getActions(status: Status): Action[] {
    switch (status) {
      case 'DRAFT':
        return [
          {
            label: 'Edit Application',
            type: 'default',
            visible: true,
            action: async () => navigate(`/applications/${tracking_number}/edit`),
          },
          {
            label: submitting ? 'Submitting…' : 'Submit for Review',
            type: 'primary',
            visible: true,
            action: handleSubmit,
          },
        ]
      case 'SUBMITTED':
        return [
          {
            label: 'Start Review',
            type: 'primary',
            visible: true,
            action: handleStartReview,
          },
        ]
      case 'UNDER_REVIEW':
        return [
          {
            label: 'Approve',
            type: 'primary',
            visible: true,
            action: handleDecision,
          },
          {
            label: 'Request More Information',
            type: 'default',
            visible: true,
            action: handleRequestInfo,
          },
          {
            label: 'Reject',
            type: 'destructive',
            visible: true,
            action: handleDecision,
          },
        ]
      case 'NEEDS_MORE_INFORMATION':
        return [
          {
            label: 'Edit Application',
            type: 'default',
            visible: true,
            action: async () => navigate(`/applications/${tracking_number}/edit`),
          },
          {
            label: 'Resubmit',
            type: 'primary',
            visible: true,
            action: handleSubmit,
          },
        ]
      case 'APPROVED':
      case 'REJECTED':
        return []
    }
  }

  if (loading) return <div className="ios-spinner" />
  if (error) return <div className="ios-form-error" style={{ margin: 16 }}>{error}</div>
  if (!app) return <div className="ios-empty">Application not found</div>

  const actions = getActions(app.status)

  return (
    <div>
      <nav className="ios-nav">
        <div className="ios-nav-inner">
          <div className="ios-nav-left">
            <button className="ios-nav-btn" onClick={() => navigate('/')}>
              Back
            </button>
          </div>
          <div className="ios-nav-title">Application</div>
          <div className="ios-nav-right">
            {app.status === 'DRAFT' && (
              <button
                className="ios-nav-btn ios-nav-btn-bold"
                onClick={() => navigate(`/applications/${tracking_number}/edit`)}
              >
                Edit
              </button>
            )}
            {app.status === 'NEEDS_MORE_INFORMATION' && (
              <button
                className="ios-nav-btn ios-nav-btn-bold"
                onClick={() => navigate(`/applications/${tracking_number}/edit`)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Status Banner */}
      <div style={{ padding: '12px 16px 0' }}>
        <span className={`ios-badge ios-badge-${app.status.toLowerCase()}`} style={{ fontSize: 14, padding: '4px 14px', borderRadius: 14 }}>
          {STATUS_LABELS[app.status]}
        </span>
      </div>

      {/* Tracking Number */}
      <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'var(--ios-text-tertiary)', fontFamily: 'monospace' }}>
        #{app.tracking_number}
      </div>

      {/* Applicant Info */}
      <div className="ios-card" style={{ marginTop: 12 }}>
        <div className="ios-card-header">Applicant</div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Name</span>
          <span className="ios-card-row-value">{app.applicant_name}</span>
        </div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Email</span>
          <span className="ios-card-row-value">{app.applicant_email}</span>
        </div>
      </div>

      {/* Application Details */}
      <div className="ios-card">
        <div className="ios-card-header">Details</div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Type</span>
          <span className="ios-card-row-value">{APPLICATION_TYPE_LABELS[app.application_type]}</span>
        </div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Company</span>
          <span className="ios-card-row-value">{app.company_name || '—'}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="ios-card">
        <div className="ios-card-header">Timeline</div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Created</span>
            <span className="ios-card-row-value">{formatLocalDateTime(app.created_at)}</span>
        </div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Submitted</span>
          <span className="ios-card-row-value">{formatLocalDateTime(app.submitted_at)}</span>
        </div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Reviewed</span>
          <span className="ios-card-row-value">{formatLocalDateTime(app.reviewed_at)}</span>
        </div>
        <div className="ios-card-row">
          <span className="ios-card-row-label">Updated</span>
          <span className="ios-card-row-value">{formatLocalDateTime(app.updated_at)}</span>
        </div>
      </div>

      {/* Reviewer Comments */}
      {app.reviewer_comments && (
        <div className="ios-card">
          <div className="ios-card-header">Reviewer Comments</div>
          <div style={{ padding: '12px 16px', fontSize: 15, color: 'var(--ios-text)', lineHeight: 1.5 }}>
            {app.reviewer_comments}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="ios-actions" style={{ marginTop: 20 }}>
          {actions
            .filter((a) => a.visible)
            .map((action, i) => (
              <button
                key={i}
                className={`ios-action-btn ${
                  action.type === 'destructive'
                    ? 'ios-action-btn-destructive'
                    : action.type === 'primary'
                    ? 'ios-action-btn-primary'
                    : 'ios-action-btn-default'
                }`}
                onClick={action.action}
                disabled={submitting && action.label.includes('Submitting')}
              >
                {action.label}
              </button>
            ))}
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
