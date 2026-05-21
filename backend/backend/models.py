import datetime
import uuid

from django.db import models


class Status(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SUBMITTED = "SUBMITTED", "Submitted"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    APPROVED = "APPROVED", "Approved"
    NEEDS_MORE_INFORMATION = "NEEDS_MORE_INFORMATION", "Needs More Information"
    REJECTED = "REJECTED", "Rejected"


class ApplicationType(models.TextChoices):
    RECORDATION = "RECORDATION", "Recordation"
    RENEWAL = "RENEWAL", "Renewal"
    CHANGE_OF_OWNERSHIP = "CHANGE_OF_OWNERSHIP", "Change of Ownership"
    CHANGE_OF_NAME = "CHANGE_OF_NAME", "Change of Name"
    DISCOUNTINUATION = "DISCONTINUATION", "Discontinuation"


class Application(models.Model):
    tracking_number = models.UUIDField(
        primary_key=True, editable=False, default=uuid.uuid7
    )
    applicant_name = models.CharField(max_length=60, null=False, blank=False)
    applicant_email = models.EmailField(max_length=60, null=False, blank=False)
    application_type = models.CharField(
        max_length=50, choices=ApplicationType.choices, null=False, blank=False
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.DRAFT,
        null=False,
        blank=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_comments = models.TextField(
        null=True, max_length=100, blank=True, default=""
    )
    company_name = models.CharField(max_length=100, null=True, blank=True)

    ## logic rules
    def can_be_editted(self) -> bool:
        return self.status in [Status.DRAFT, Status.NEEDS_MORE_INFORMATION]

    def can_be_submitted(self) -> bool:
        return self.status in [Status.DRAFT, Status.NEEDS_MORE_INFORMATION]

    def can_be_reviewed(self) -> bool:
        return self.status == Status.SUBMITTED

    def can_receive_decision(self) -> bool:
        return self.status == Status.UNDER_REVIEW

    def check_comment(self):
        if (
            self.status == Status.NEEDS_MORE_INFORMATION
            or self.status == Status.REJECTED
        ) and not self.reviewer_comments:
            raise ValueError(
                "Reviewer comments are required when the status is 'Needs More Information' or 'Rejected'."
            )

    def save(self, *args, **kwargs):
        if self.can_be_reviewed():
            self.status = Status.UNDER_REVIEW
        self.check_comment()
        ## check status is in the enum
        if self.status not in [choice[0] for choice in Status.choices]:
            raise ValueError(f"Invalid status: {self.status}")
        self.reviewed_at = (
            datetime.datetime.now() if self.status == Status.UNDER_REVIEW else None
        )
        super().save(*args, **kwargs)
