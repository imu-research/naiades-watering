"""
Django settings for naiades_watering project.

Generated by 'django-admin startproject' using Django 1.11.16.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os

# load .env file settings
from dotenv import load_dotenv
load_dotenv()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '(+2t1f50rry*%jz0#904r-t^=9=5it76nw3zct!@rslc=y4nls'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']
INTERNAL_IPS = ['127.0.0.1']

# Set environment
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'DEV')

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'keyrock',
    'watering',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'naiades_watering.middleware.AuthRequiredMiddleware',
]

ROOT_URLCONF = 'naiades_watering.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',
                'naiades_watering.context_processors.naiades_processor',
            ],
        },
    },
]

WSGI_APPLICATION = 'naiades_watering.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'naiades_watering'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', '1234'),
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGES = (
    ('en', 'English'),
    ('fr', 'French'),
)
LANGUAGE_CODE = 'en'
LOCALE_PATHS = [
    os.path.join(BASE_DIR, "locale")
]

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/watering/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static')
]

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Login & Logout
LOGIN_URL = '/watering/keyrock/keyrockprovider/login'
LOGIN_REDIRECT_URL = '/watering/'
LOGOUT_URL = '/watering/logout'
ADMIN_URL = '/watering/admin'

# KeyRock Authentication
OAUTH_SERVER_BASEURL = 'https://test.naiades-project.eu:3443'
SOCIALACCOUNT_ADAPTER = 'keyrock.adapter.KeyRockAdapter'
ACCOUNT_LOGOUT_REDIRECT_URL = '/watering/login'
SITE_ID = 1
ACCOUNT_EMAIL_VERIFICATION = "none"

APPEND_SLASH = True

CSRF_COOKIE_NAME = "csrftoken_watering"
CSRF_COOKIE_PATH = SESSION_COOKIE_PATH = "/watering/"

KSI_ENDPOINT = "https://ksi-service.herokuapp.com"
KSI_SECRET = "mvtz866HuJb_$?ec"

# Group names
GROUP_GARDENER = "GARDENER"
GROUP_BACKOFFICE = "BACKOFFICE"
DEFAULT_GROUPS = [GROUP_GARDENER, GROUP_BACKOFFICE, ]


if os.environ.get("ENVIRONMENT") == "PRODUCTION":
    import dj_database_url

    DEBUG = (os.environ.get("ENABLE_DEBUG") or "").lower() in ["true", "on"]

    DATABASES = {
        'default': dj_database_url.config()
    }
    DATABASES['default']['CONN_MAX_AGE'] = 500

    ALLOWED_HOSTS = ['*']

    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

    MIDDLEWARE.append(
        'whitenoise.middleware.WhiteNoiseMiddleware',
    )

    # SSl settings
    # Honor the 'X-Forwarded-Proto' header for request.is_secure()
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True


# Airbrake
if os.environ.get("AIRBRAKE_API_KEY") and os.environ.get("AIRBRAKE_PROJECT_ID"):
    AIRBRAKE = dict(
        project_id=int(os.environ["AIRBRAKE_PROJECT_ID"]),
        project_key=os.environ["AIRBRAKE_API_KEY"],
    )

    MIDDLEWARE += ["pybrake.django.AirbrakeMiddleware"]

    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "airbrake": {
                "level": "ERROR",
                "class": "pybrake.LoggingHandler",
            },
        },
        "loggers": {
            "app": {
                "handlers": ["airbrake"],
                "level": "ERROR",
                "propagate": True,
            },
        },
    }
