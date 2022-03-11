"""avgs_website URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from blog import views as blog_views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from events import views as event_views
from rest_framework import routers
from rest_framework import urls as api_auth_urls
from users import views as user_views

router = routers.DefaultRouter()
router.register(r"users", user_views.UserView)
router.register(r"blog", blog_views.PostView)
router.register(r"events", event_views.EventsView, "event")

# TODO: Should viewsets end in ViewSet instead of View?
#       Clean this up by importing from app's urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/csrf/", user_views.set_csrf_token),
    path("api/login/", user_views.login_view),
    path("api/logout/", user_views.logout_view),
    path("api/profile/", user_views.ProfileView.as_view()),
    path("api/register/", user_views.RegisterView.as_view()),
    path("api/session/", user_views.SessionView.as_view()),
    path("api/api-auth/", include(api_auth_urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# TODO: uncomment to allow for .json url suffixes
# urlpatterns = format_suffix_patterns(urlpatterns)
