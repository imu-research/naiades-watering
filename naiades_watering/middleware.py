import json

from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.deprecation import MiddlewareMixin

from naiades_watering.settings import LOGIN_URL, LOGOUT_URL, ADMIN_URL


class AuthRequiredMiddleware(object):

    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        if request.path.startswith(LOGIN_URL):
            return self.get_response(request)

        if request.path.startswith(ADMIN_URL):
            return self.get_response(request)

        if not request.user.is_authenticated:
            return redirect(LOGIN_URL)

        response = self.get_response(request)

        if request.path.startswith(LOGOUT_URL):
            return redirect(LOGIN_URL)

        if not request.user.is_authenticated:
            return redirect(f'{LOGIN_URL}/?next={request.get_full_path()}')

        return response
