export type ApplicationType =
  | 'RECORDATION'
  | 'RENEWAL'
  | 'CHANGE_OF_OWNERSHIP'
  | 'CHANGE_OF_NAME'
  | 'DISCONTINUATION'

export type Status =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'NEEDS_MORE_INFORMATION'
  | 'REJECTED'

export interface ApplicationOut {
  tracking_number: string
  applicant_name: string
  applicant_email: string
  company_name: string | null
  application_type: ApplicationType
  status: Status
  created_at: string
  updated_at: string
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_comments: string | null
}

export interface ErrorSchema {
  error: string
}

export interface CreateDraftApplicationIn {
  applicant_name: string
  applicant_email: string
  application_type: ApplicationType
  company_name: string | null
}

export interface PatchSchema {
  applicant_name?: string | null
  applicant_email?: string | null
  application_type?: ApplicationType | null
  company_name?: string | null
}

export interface ReviewApplicationIn {
  reviewer_comments: string
}

export interface FinalReview {
  reviewer_comments: string
  status: 'APPROVED' | 'REJECTED'
}

export interface ListParams {
  limit?: number
  offset?: number
  status?: string | null
}

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  RECORDATION: 'Recordation',
  RENEWAL: 'Renewal',
  CHANGE_OF_OWNERSHIP: 'Change of Ownership',
  CHANGE_OF_NAME: 'Change of Name',
  DISCONTINUATION: 'Discontinuation',
}

export const STATUS_LABELS: Record<Status, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  NEEDS_MORE_INFORMATION: 'Needs More Information',
  REJECTED: 'Rejected',
}
