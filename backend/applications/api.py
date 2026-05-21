import datetime

from django.db import connection
from ninja import NinjaAPI

from .models import Application, Status
from .schemas import ApplicationOut, CreateDraftApplicationIn, ErrorSchema

router = NinjaAPI()


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


@router.post("/applications/draft", response={201: ApplicationOut, 400: ErrorSchema})
def create_draft_application(request, payload: CreateDraftApplicationIn):
    application = Application.objects.create(
        applicant_name=payload.applicant_name,
        applicant_email=payload.applicant_email,
        application_type=payload.application_type,
        company_name=payload.company_name,
    )
    return application


@router.get("/applications", response=list[ApplicationOut])
def list_applications(request):
    applications = Application.objects.all()
    return applications


@router.get(
    "/applications/{tracking_number}", response={200: ApplicationOut, 404: ErrorSchema}
)
def get_application(request, tracking_number: str):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.patch(
    "/applications/{tracking_number}", response={200: ApplicationOut, 404: ErrorSchema}
)
def update_application(
    request, tracking_number: str, payload: CreateDraftApplicationIn
):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_be_editted():
            return {"error": "Application cannot be edited in its current status"}, 400
        application.applicant_name = payload.applicant_name
        application.applicant_email = payload.applicant_email
        application.application_type = payload.application_type
        application.company_name = payload.company_name
        application.save()
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.post(
    "/applications/{tracking_number}/submit",
    response={200: ApplicationOut, 404: ErrorSchema},
)
def submit_application(request, tracking_number: str):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_be_submitted():
            return {
                "error": "Application cannot be submitted in its current status"
            }, 400
        application.status = Status.SUBMITTED
        application.submitted_at = datetime.datetime.now()
        application.save()
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.put(
    "/applications/{tracking_number}/review",
    response={200: ApplicationOut, 404: ErrorSchema, 400: ErrorSchema},
)
def review_application(request, tracking_number: str, payload: ApplicationOut):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_be_reviewed():
            return {
                "error": "Application cannot be reviewed in its current status"
            }, 400
        application.status = payload.status
        if payload.reviewer_comments is not None:
            application.reviewer_comments = payload.reviewer_comments
        application.save()
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.put(
    "/applications/{tracking_number}/decision",
    response={200: ApplicationOut, 404: ErrorSchema, 400: ErrorSchema},
)
def make_decision(request, tracking_number: str, payload: ApplicationOut):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_receive_decision():
            return {
                "error": "Application cannot receive decision in its current status"
            }, 400
        application.status = payload.status
        if payload.reviewer_comments is not None:
            application.reviewer_comments = payload.reviewer_comments
        else:
            return {
                "error": "Reviewer comments are required when making a decision"
            }, 400
        application.save()
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.get("/applications/status/{status}", response=list[ApplicationOut])
def list_applications_by_status(request, status: Status):
    applications = Application.objects.filter(status=status)
    return applications
