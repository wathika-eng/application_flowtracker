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
    DISCONTINUATION = "DISCONTINUATION", "Discontinuation"


class Application(models.Model):
    tracking_number = models.UUIDField(
        primary_key=True, editable=False, default=uuid.uuid4
    )
    applicant_name = models.CharField(max_length=60, null=False, blank=False)
    applicant_email = models.EmailField(
        max_length=60,
        null=False,
        blank=False,
        db_index=True,
    )
    application_type = models.CharField(
        max_length=50,
        choices=ApplicationType.choices,
        null=False,
        blank=False,
        db_index=True,
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.DRAFT,
        null=False,
        blank=False,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_started = models.DateTimeField(null=True, blank=True)
    reviewer_comments = models.TextField(
        max_length=60, null=True, blank=True, default=""
    )
    company_name = models.CharField(max_length=60, null=True, blank=True)

    ## logic rules
    def can_be_editted(self) -> bool:
        return self.status in [Status.DRAFT, Status.NEEDS_MORE_INFORMATION]

    def can_be_submitted(self) -> bool:
        return self.status in [Status.DRAFT, Status.NEEDS_MORE_INFORMATION]

    def can_be_reviewed(self) -> bool:
        return self.status == Status.SUBMITTED

    def can_receive_decision(self) -> bool:
        return self.status == Status.UNDER_REVIEW

    # def check_comment(self):
    #     if (
    #         self.status == Status.NEEDS_MORE_INFORMATION
    #         or self.status == Status.REJECTED
    #     ) and not self.reviewer_comments:
    #         raise ValueError(
    #             "Reviewer comments are required when the status is 'Needs More Information' or 'Rejected'."
    #         )

    def submit(self):
        if not self.can_be_submitted():
            raise ValueError("Application cannot be submitted in its current status")
        self.status = Status.SUBMITTED
        self.reviewed_at = datetime.datetime.now()
        self.submitted_at = datetime.datetime.now()
        self.save()

    def start_review(self, comments: str | None = None):
        if not self.can_be_reviewed():
            raise ValueError("Application cannot be reviewed in its current status")
        self.status = Status.UNDER_REVIEW
        self.review_started = datetime.datetime.now()
        # if comments.strip() == "":
        #     raise ValueError("Reviewer comments cannot be empty when starting review.")
        # allows reviews to be started without comments
        self.reviewer_comments = comments if comments else ""
        # self.reviewed_at = datetime.datetime.now()
        self.save()

    def reject(self, comments: str):
        if not self.can_receive_decision():
            raise ValueError(
                "Application cannot receive decision in its current status"
            )
        if comments.strip() == "":
            raise ValueError("Reviewer comments cannot be empty when rejecting.")
        self.status = Status.REJECTED
        self.reviewer_comments = comments
        self.save()

    # approval doesn't require comments
    def approve(self, comments: str | None = None):
        if not self.can_receive_decision():
            raise ValueError(
                "Application cannot receive decision in its current status"
            )
        # if comments is not None and comments.strip() == "":
        #     self.reviewer_comments = ""
        self.status = Status.APPROVED
        self.reviewer_comments = comments
        self.save()

    def needs_more_information(self, comments: str):
        if not self.can_receive_decision():
            raise ValueError(
                "Application cannot receive decision in its current status"
            )
        if comments.strip() == "":
            raise ValueError(
                "Reviewer comments cannot be empty when requesting more information."
            )
        self.status = Status.NEEDS_MORE_INFORMATION
        self.reviewer_comments = comments
        self.save()

    def check_application_type(self):
        if self.application_type not in ApplicationType.values:
            raise ValueError("Invalid application type")

    def clean(self):
        self.check_application_type()
        if (
            self.status in [Status.NEEDS_MORE_INFORMATION, Status.REJECTED]
            and not self.reviewer_comments
        ):
            raise ValueError("Reviewer comments are required for this status.")

    def save(self, *args, **kwargs):
        self.full_clean()

        if self.status == Status.UNDER_REVIEW and not self.reviewed_at:
            self.reviewed_at = datetime.datetime.now()

        super().save(*args, **kwargs)
