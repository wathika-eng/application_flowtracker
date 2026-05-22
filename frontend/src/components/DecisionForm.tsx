import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import Toast from './Toast'

export default function DecisionForm() {
  const { tracking_number } = useParams()
  const navigate = useNavigate()

  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null)

  async function handleSubmit() {
    if (!tracking_number || !decision) return
    setSaving(true)
    setError(null)
    try {
      await api.makeDecision(tracking_number, {
        reviewer_comments: comments,
        status: decision,
      })
      setToast(
        decision === 'APPROVED' ? 'Application approved' : 'Application rejected'
      )
      setTimeout(() => navigate(`/applications/${tracking_number}`), 300)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <nav className="ios-nav">
        <div className="ios-nav-inner">
          <div className="ios-nav-left">
            <button className="ios-nav-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
          <div className="ios-nav-title">Decision</div>
          <div className="ios-nav-right">
            <button
              className="ios-nav-btn ios-nav-btn-bold"
              disabled={saving || !decision}
              onClick={handleSubmit}
            >
              {saving ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </div>
      </nav>

      {error && <div className="ios-form-error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="ios-form-group" style={{ marginTop: 16 }}>
        <div className="ios-form-group-header">Decision</div>
        <div className="ios-field">
          <label className="ios-field-label">Approve or Reject</label>
          <select
            className="ios-field-select"
            value={decision ?? ''}
            onChange={(e) => setDecision(e.target.value as 'APPROVED' | 'REJECTED')}
          >
            <option value="" disabled>
              Select a decision
            </option>
            <option value="APPROVED">Approve</option>
            <option value="REJECTED">Reject</option>
          </select>
        </div>
        <div className="ios-field">
          <label className="ios-field-label">Reviewer Comments</label>
          <textarea
            className="ios-field-input"
            style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Provide your reasoning…"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
