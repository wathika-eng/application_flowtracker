import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type {
  ApplicationType,
  ApplicationOut,
  CreateDraftApplicationIn,
} from '../api/types'
import { APPLICATION_TYPE_LABELS } from '../api/types'
import Toast from './Toast'

const APP_TYPES = Object.keys(APPLICATION_TYPE_LABELS) as ApplicationType[]

type FormData = {
  applicant_name: string
  applicant_email: string
  application_type: ApplicationType
  company_name: string
}

const emptyForm: FormData = {
  applicant_name: '',
  applicant_email: '',
  application_type: 'RECORDATION',
  company_name: '',
}

export default function AppForm() {
  const { tracking_number } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(tracking_number)

  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!tracking_number) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    api
      .getApplication(tracking_number)
      .then((app: ApplicationOut) => {
        if (!cancelled) {
          setForm({
            applicant_name: app.applicant_name,
            applicant_email: app.applicant_email,
            application_type: app.application_type,
            company_name: app.company_name ?? '',
          })
        }
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tracking_number])

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleCreate() {
    setSaving(true)
    setError(null)
    try {
      const payload: CreateDraftApplicationIn = {
        applicant_name: form.applicant_name,
        applicant_email: form.applicant_email,
        application_type: form.application_type,
        company_name: form.company_name || null,
      }
      const app = await api.createDraft(payload)
      setToast('Application created')
      setTimeout(() => navigate(`/applications/${app.tracking_number}`), 300)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!tracking_number) return
    setSaving(true)
    setError(null)
    try {
      await api.updateApplication(tracking_number, {
        applicant_name: form.applicant_name,
        applicant_email: form.applicant_email,
        application_type: form.application_type,
        company_name: form.company_name || null,
      })
      setToast('Application updated')
      setTimeout(() => navigate(`/applications/${tracking_number}`), 300)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="ios-spinner" />

  return (
    <div>
      <nav className="ios-nav">
        <div className="ios-nav-inner">
          <div className="ios-nav-left">
            <button className="ios-nav-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
          <div className="ios-nav-title">{isEdit ? 'Edit' : 'New'} Application</div>
          <div className="ios-nav-right">
            <button
              className="ios-nav-btn ios-nav-btn-bold"
              disabled={saving || !form.applicant_name || !form.applicant_email}
              onClick={isEdit ? handleUpdate : handleCreate}
            >
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </nav>

      {error && <div className="ios-form-error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="ios-form-group" style={{ marginTop: 16 }}>
        <div className="ios-form-group-header">Applicant</div>
        <div className="ios-field">
          <label className="ios-field-label">Full Name</label>
          <input
            className="ios-field-input"
            placeholder="e.g. John Appleseed"
            value={form.applicant_name}
            onChange={(e) => set('applicant_name', e.target.value)}
          />
        </div>
        <div className="ios-field">
          <label className="ios-field-label">Email</label>
          <input
            className="ios-field-input"
            type="email"
            placeholder="e.g. john@example.com"
            value={form.applicant_email}
            onChange={(e) => set('applicant_email', e.target.value)}
          />
        </div>
      </div>

      <div className="ios-form-group">
        <div className="ios-form-group-header">Details</div>
        <div className="ios-field">
          <label className="ios-field-label">Application Type</label>
          <select
            className="ios-field-select"
            value={form.application_type}
            onChange={(e) => set('application_type', e.target.value as ApplicationType)}
          >
            {APP_TYPES.map((t) => (
              <option key={t} value={t}>
                {APPLICATION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="ios-field">
          <label className="ios-field-label">Company (optional)</label>
          <input
            className="ios-field-input"
            placeholder="e.g. ACME Corp"
            value={form.company_name}
            onChange={(e) => set('company_name', e.target.value)}
          />
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
