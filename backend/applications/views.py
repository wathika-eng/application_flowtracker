from django.http import JsonResponse
from django.shortcuts import redirect


def handler404(request, exception):
    return JsonResponse({"error": "Not found"}, status=404)


def handler_root(request):
    return redirect("/api/")
