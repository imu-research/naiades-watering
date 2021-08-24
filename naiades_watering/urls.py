"""naiades_watering URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.urls import include, path

import django.contrib.auth.views as auth_views

from allauth.socialaccount.providers.oauth2.urls import default_urlpatterns

from naiades_watering import views

urlpatterns = [
    # i18n
    url(r'^watering/i18n/', include('django.conf.urls.i18n')),

    # admin
    url(r'^watering/admin/', admin.site.urls),

    # auth
    path('accounts/', include('allauth.urls')),
    path('watering/login/', auth_views.login, name='login'),
    path('watering/logout/', views.logout, name='logout'),

    # KeyRock
    url(r'watering/keyrock/', include('keyrock.urls')),

    # app
    path('watering/', include('watering.urls')),

    # / redirect
    path('', views.home_redirect, name='home-redirect'),
]
