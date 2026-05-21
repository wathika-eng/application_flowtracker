from datetime import datetime
from uuid import UUID

from ninja import Schema
from pydantic import EmailStr

from .models import ApplicationType, Status


class ApplicationOut(Schema):
    tracking_number: UUID
    applicant_name: str
    applicant_email: EmailStr
    application_type: ApplicationType
    status: Status
    created_at: datetime
    updated_at: datetime
    submitted_at: datetime | None
    reviewed_at: datetime | None
    reviewer_comments: str | None


class CreateDraftApplicationIn(Schema):
    applicant_name: str
    applicant_email: EmailStr
    application_type: ApplicationType
    company_name: str | None
