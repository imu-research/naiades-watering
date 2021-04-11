from naiades_watering.settings import DEBUG


def naiades_processor(request):
    return {
        "TESTING": DEBUG,
    }
