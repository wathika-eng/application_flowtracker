from django.shortcuts import redirect


# Create your views here.
## default 404 handler
def handler404(request, exception):
    return {"error": "Not found"}, 404


## redirect root to api
def handler_root(request):
    return redirect("/api/")
