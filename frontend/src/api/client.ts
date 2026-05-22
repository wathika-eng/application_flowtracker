import type {
  ApplicationOut,
  CreateDraftApplicationIn,
  PatchSchema,
  ReviewApplicationIn,
  FinalReview,
  ListParams,
} from './types'
import type { ErrorSchema } from './types'

const BASE_URL = 'http://localhost:8000/api'

export class ApiError extends Error {
  status: number
  body: ErrorSchema | null

  constructor(status: number, body: ErrorSchema | null) {
    super(body?.error || `Request failed (${status})`)
    this.status = status
    this.body = body
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  health: () => request<unknown>('/health'),

  listApplications: (params?: ListParams) => {
    const searchParams = new URLSearchParams()
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
    if (params?.offset !== undefined) searchParams.set('offset', String(params.offset))
    if (params?.status) searchParams.set('status', params.status)
    const qs = searchParams.toString()
    return request<ApplicationOut[]>(`/applications${qs ? `?${qs}` : ''}`)
  },

  getApplication: (trackingNumber: string) =>
    request<ApplicationOut>(`/applications/${trackingNumber}`),

  createDraft: (data: CreateDraftApplicationIn) =>
    request<ApplicationOut>('/applications/draft', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplication: (trackingNumber: string, data: PatchSchema) =>
    request<ApplicationOut>(`/applications/${trackingNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  submitApplication: (trackingNumber: string) =>
    request<ApplicationOut>(`/applications/${trackingNumber}/submit`, {
      method: 'POST',
    }),

  reviewApplication: (trackingNumber: string, data: ReviewApplicationIn) =>
    request<ApplicationOut>(`/applications/${trackingNumber}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  makeDecision: (trackingNumber: string, data: FinalReview) =>
    request<ApplicationOut>(`/applications/${trackingNumber}/decision`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}


