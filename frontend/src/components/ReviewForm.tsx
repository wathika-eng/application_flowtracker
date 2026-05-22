import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import Toast from './Toast'

export default function ReviewForm() {
  const { tracking_number } = useParams()
  const navigate = useNavigate()

  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function handleSubmit() {
    if (!tracking_number) return
    setSaving(true)
    setError(null)
    try {
      await api.reviewApplication(tracking_number, {
        reviewer_comments: comments,
      })
      setToast('Review started')
      setTimeout(() => navigate(`/applications/${tracking_number}`), 300)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start review')
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
          <div className="ios-nav-title">Start Review</div>
          <div className="ios-nav-right">
            <button
              className="ios-nav-btn ios-nav-btn-bold"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? 'Saving…' : 'Start'}
            </button>
          </div>
        </div>
      </nav>

      {error && <div className="ios-form-error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="ios-form-group" style={{ marginTop: 16 }}>
        <div className="ios-form-group-header">Review Notes</div>
        <div className="ios-field">
          <label className="ios-field-label">Reviewer Comments</label>
          <textarea
            className="ios-field-input"
            style={{ minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Add your review notes here…"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
