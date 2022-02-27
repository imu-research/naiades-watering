from allauth.socialaccount.models import SocialApp
from django.contrib.auth import logout as logout_fn
from django.shortcuts import redirect

from naiades_watering.settings import LOGIN_REDIRECT_URL, OAUTH_SERVER_BASEURL


def home_redirect(request):
    return redirect(LOGIN_REDIRECT_URL)


def logout(request):
    # clear session
    logout_fn(request)

    # get client id
    client_id = ""
    app = SocialApp.objects.filter(provider="keyrockprovider").first()
    if app:
        client_id = f"&client_id={app.client_id}"
        print(client_id)

    # logout from keyrock
    return redirect(f"{OAUTH_SERVER_BASEURL}/auth/external_logout?_method=DELETE&{client_id}")


def error(request):
    # request to simulate a 500 error
    raise ValueError("This is a failing request.")
