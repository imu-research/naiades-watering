import json

from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.deprecation import MiddlewareMixin


class AuthRequiredMiddleware(object):

    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        if request.path == '/login/':
            return self.get_response(request)

        if request.path.startswith('/admin'):
            return self.get_response(request)

        if not request.user.is_authenticated:
            return redirect('/login/')

        response = self.get_response(request)

        if request.path.startswith('/logout'):
            return redirect('/login/')

        if not request.user.is_authenticated:
            return redirect(f'/login/?next={request.get_full_path()}')

        return response
