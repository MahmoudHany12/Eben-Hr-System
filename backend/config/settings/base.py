import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / '.env')

# Environment variables (centralized)
DJANGO_SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'change-me')
SECRET_KEY = DJANGO_SECRET_KEY

# DEBUG: accept 'True'/'true' (string) or boolean-like values
DEBUG = os.getenv('DEBUG', 'False').lower() in ('1', 'true', 'yes')

# ALLOWED_HOSTS: comma-separated
_allowed = os.getenv('ALLOWED_HOSTS', 'localhost')
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(',') if h.strip()]

# Ensure common local hosts are always allowed to avoid DisallowedHost on dev machines
for _host in ('127.0.0.1', 'localhost', '0.0.0.0', 'testserver'):
    if _host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(_host)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',
    'apps.core',
    'apps.accounts',
    'apps.companies',
    'apps.departments',
    'apps.employees',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST', 'localhost')
db_port = os.getenv('DB_PORT', '5432')

if not db_name:
    raise RuntimeError('DB_NAME must be set for PostgreSQL configuration')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': db_name,
        'USER': db_user,
        'PASSWORD': db_password,
        'HOST': db_host,
        'PORT': db_port,
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'EXCEPTION_HANDLER': 'apps.core.handlers.custom_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'PAGE_SIZE': 25,
}

# drf-spectacular configuration for OpenAPI/Swagger
SPECTACULAR_SETTINGS = {
    'TITLE': 'Employee Management System API',
    'DESCRIPTION': 'RESTful API for managing companies, departments, and employees with JWT authentication',
    'VERSION': '1.0.0',
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SERVERS': [
        {'url': 'http://localhost:8000', 'description': 'Development'},
        {'url': 'https://api.example.com', 'description': 'Production'},
    ],
    # Enable JWT Bearer authentication in Swagger UI
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
        }
    },
    'SECURITY': [{'Bearer': []}],
    'DISALLOW_ARBITRARY_MEDIA_TYPE_FOR_FORM_DATA': True,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS Configuration for development (allow Swagger UI and local requests)
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:8000',
#     'http://127.0.0.1:8000',
#     'http://localhost:3000',
#     'http://localhost:5173',  # Vite default
#     'http://127.0.0.1:3000',
#     'http://127.0.0.1:5173',
#     'http://localhost:5174',
#     'http://127.0.0.1:5174',
# ]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https?://localhost(:\d+)?$",
    r"^https?://127\.0\.0\.1(:\d+)?$",
    r"^https?://\[::1\](:\d+)?$",
]
# Enhanced CORS settings for robustness
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
# Additional CORS preflight cache time (seconds)
CORS_PREFLIGHT_MAX_AGE = 86400

# For production, add specific domain CORS_ALLOWED_ORIGINS
# For development only, uncomment to allow all origins: CORS_ALLOW_ALL_ORIGINS = True
