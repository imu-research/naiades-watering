from django.shortcuts import redirect

from naiades_watering.settings import LOGIN_URL, LOGOUT_URL, ADMIN_URL, STATIC_URL


class AuthRequiredMiddleware(object):

    whitelisted_prefixes = [
        LOGIN_URL,
        ADMIN_URL,
        STATIC_URL,
        "/watering/keyrock/",
        "/watering/consumptions/",
    ]

    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        if any(
            [request.path.startswith(prefix) for prefix in self.whitelisted_prefixes]
        ):
            return self.get_response(request)

        if not request.user.is_authenticated:
            return redirect(LOGIN_URL)

        response = self.get_response(request)

        if request.path.startswith(LOGOUT_URL):
            return redirect(LOGIN_URL)

        if not request.user.is_authenticated:
            return redirect(f'{LOGIN_URL}/?next={request.get_full_path()}')

        return response
