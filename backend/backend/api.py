import datetime

from ninja import NinjaAPI

from backend.backend.models import Application, Status
from backend.backend.schemas import ApplicationOut, CreateDraftApplicationIn

router = NinjaAPI()


@router.get("/")
def test(request):
    return {"message": "API is up", "time": datetime.datetime.now().isoformat()}


# @router.get("/health")
# def health():


@router.post("/applications/draft", response={201: ApplicationOut})
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


@router.get("/applications/{tracking_number}", response=ApplicationOut)
def get_application(request, tracking_number: str):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.patch("/applications/{tracking_number}", response=ApplicationOut)
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


@router.post("/applications/{tracking_number}/submit", response=ApplicationOut)
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


@router.put("/applications/{tracking_number}/review", response=ApplicationOut)
def review_application(request, tracking_number: str, payload: ApplicationOut):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_be_reviewed():
            return {
                "error": "Application cannot be reviewed in its current status"
            }, 400
        application.status = payload.status
        application.reviewer_comments = payload.reviewer_comments
        application.save()
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404


@router.put("/applications/{tracking_number}/decision", response=ApplicationOut)
def make_decision(request, tracking_number: str, payload: ApplicationOut):
    try:
        application = Application.objects.get(tracking_number=tracking_number)
        if not application.can_receive_decision():
            return {
                "error": "Application cannot receive decision in its current status"
            }, 400
        application.status = payload.status
        application.reviewer_comments = payload.reviewer_comments
        application.save()
        return application
    except Application.DoesNotExist:
        return {"error": "Application not found"}, 404
