from naiades_watering.settings import DEBUG


def naiades_processor(request):
    return {
        "TESTING": DEBUG,
        "AUTOMATIC_CLUSTER_REDIRECT": not bool(request.COOKIES.get("disable_automatic_cluster_redirect")),
    }
