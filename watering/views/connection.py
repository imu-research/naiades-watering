from django.http import JsonResponse

from watering.managers import OrionEntity


def get_connection_status(request):
    return JsonResponse({
        "connection_status": OrionEntity().get_connection_status(),
    })
