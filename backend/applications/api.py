import datetime
import uuid

from django.db import IntegrityError, connection
from ninja import NinjaAPI, Query
from ninja.throttling import AnonRateThrottle

from .models import Application, Status
from .schemas import (
    ApplicationOut,
    CreateDraftApplicationIn,
    ErrorSchema,
    FinalReview,
    PatchSchema,
    ReviewApplicationIn,
)

router = NinjaAPI(throttle=AnonRateThrottle(rate="10/s"))


@router.get("/")
def test(request):
    return {"message": "API is up", "time": datetime.datetime.now().isoformat()}


@router.get("/health")
def health(request):
    start = datetime.datetime.now()

    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()

    latency = (datetime.datetime.now() - start).total_seconds()

    return {
        "status": "ok",
        "db_latency_seconds": latency,
    }


# create a new draft
@router.post("/applications/draft", response={201: ApplicationOut, 400: ErrorSchema})
def create_draft_application(request, payload: CreateDraftApplicationIn):
    try:
        application = Application(
            applicant_name=payload.applicant_name,
            applicant_email=payload.applicant_email,
            application_type=payload.application_type,
            company_name=payload.company_name,
        )
        application.full_clean()
        application.save()
    except IntegrityError as e:
        print(f"Database constraint error: {e}")
        return 400, {"error": "Database constraint error"}
    return 201, application


# fetch all applications, if none, just return empty list, default to 25 records at first
@router.get("/applications", response={200: list[ApplicationOut], 400: ErrorSchema})
def list_applications(
    request, limit: int = 25, offset: int = 0, status: str | None = None
):
    if status is not None:
        try:
            status = Status(status.upper())

            applications = Application.objects.filter(status=status.value).order_by(
                "-created_at"
            )[offset : offset + limit]
        except ValueError:
            return 400, {"error": "Invalid status value"}
    else:
        applications = Application.objects.all().order_by("-created_at")[
            offset : offset + limit
        ]
    return 200, applications


#  get more details about an application
@router.get(
    "/applications/{tracking_number}", response={200: ApplicationOut, 404: ErrorSchema}
)
def get_application(request, tracking_number: uuid.UUID):
    try:
        application = Application.objects.get(tracking_number=str(tracking_number))
        return application
    except Application.DoesNotExist:
        return 404, {"error": "Application not found"}
    # except Exception as e:
    #     return {"error": str(e)}, 400


# update application if status is draft or needs more info
@router.patch(
    "/applications/{tracking_number}",
    response={200: ApplicationOut, 404: ErrorSchema, 400: ErrorSchema},
)
def update_application(request, tracking_number: uuid.UUID, payload: PatchSchema):

    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_be_editted():
            return 400, {"error": "Application cannot be edited in its current status"}
        if payload.applicant_name is not None:
            application.applicant_name = payload.applicant_name
        if payload.applicant_email is not None:
            application.applicant_email = payload.applicant_email
        if payload.application_type is not None:
            application.application_type = payload.application_type
        if payload.company_name is not None:
            application.company_name = payload.company_name
        try:
            application.full_clean()
            application.save()
        except IntegrityError as e:
            print(f"Database constraint error: {e}")
            return 400, {"error": "Database constraint error"}
        return application
    except Application.DoesNotExist:
        return 404, {"error": "Application not found"}


@router.post(
    "/applications/{tracking_number}/submit",
    response={200: ApplicationOut, 404: ErrorSchema, 400: ErrorSchema},
)
def submit_application(request, tracking_number: uuid.UUID):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if application.status == Status.SUBMITTED:
            return 400, {"error": "Application has already been submitted"}
        try:
            application.submit()
        except ValueError as e:
            return 400, {"error": str(e)}
        return 200, application
    except Application.DoesNotExist:
        return 404, {"error": "Application not found"}


# start reviewing, takes time input, comment not necessary
@router.put(
    "/applications/{tracking_number}/review",
    response={200: ApplicationOut, 404: ErrorSchema, 400: ErrorSchema},
)
def review_application(
    request, tracking_number: uuid.UUID, comments: ReviewApplicationIn
):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        try:
            application.start_review(comments=comments.reviewer_comments)
        except ValueError as e:
            return 400, {"error": str(e)}
        return application
    except Application.DoesNotExist:
        return 404, {"error": "Application not found"}


# final reviewer's decision, requires commenting
@router.put(
    "/applications/{tracking_number}/decision",
    response={200: ApplicationOut, 404: ErrorSchema, 400: ErrorSchema},
)
def make_decision(request, tracking_number: uuid.UUID, payload: FinalReview):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        try:
            if payload.status == Status.APPROVED:
                application.approve(comments=payload.reviewer_comments)
            elif payload.status == Status.REJECTED:
                application.reject(comments=payload.reviewer_comments)
            elif payload.status == Status.NEEDS_MORE_INFORMATION:
                application.needs_more_information(comments=payload.reviewer_comments)
            else:
                return 400, {"error": "Invalid status value"}
        except ValueError as e:
            return 400, {"error": str(e)}
        return application
    except Application.DoesNotExist:
        return 404, {"error": "Application not found"}


@router.exception_handler(Exception)
def global_exception_handler(request, exc):

    return router.create_response(
        request,
        {"error": "Internal server error"},
        status=500,
    )
