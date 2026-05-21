from datetime import datetime
from re import S
from uuid import UUID

from ninja import Schema
from pydantic import EmailStr
from typing_extensions import Literal

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


class ErrorSchema(Schema):
    error: str


class UpdateApplicationIn(Schema):
    applicant_name: str | None = None
    applicant_email: str | None = None
    company_name: str | None = None


class ReviewApplicationIn(Schema):
    reviewer_comments: str


class DecisionIn(Schema):
    status: Literal[
        Status.APPROVED,
        Status.REJECTED,
        Status.NEEDS_MORE_INFORMATION,
    ]
    reviewer_comments: str


class PatchSchema(Schema):
    applicant_name: str | None = None
    applicant_email: EmailStr | None = None
    application_type: ApplicationType | None = None
    company_name: str | None = None


class FinalReview(Schema):
    reviewer_comments: str
    status: Status
