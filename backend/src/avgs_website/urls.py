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
from lans import views as lan_views
from rest_framework import routers
from rest_framework import urls as api_auth_urls
from users import views as user_views

# Add routes for viewsets. Note that the prefixes are suffixed with "/<pk>/" for
# detail views, e.g., "lans/2/"", so nesting routes like "lans/ticket-requests",
# isn't a good idea unless you also do "lans/lans", which defeats the point.
router = routers.DefaultRouter()
router.register(r"users", user_views.UserViewSet)
router.register(r"lan-committee-shifts", lan_views.CommitteeShiftViewSet)
router.register(r"lan-ticket-requests", lan_views.TicketRequestViewSet)
router.register(r"lan-tickets", lan_views.TicketViewSet)
router.register(r"lan-seat-booking", lan_views.SeatBookingViewSet)
router.register(r"lan-van-booking", lan_views.VanBookingViewSet)
router.register(r"lan-food-order-shop", lan_views.FoodOrderShopViewSet)
router.register(r"lan-food-order-menu-item", lan_views.FoodOrderMenuItemViewSet)
router.register(r"lan-food-order", lan_views.FoodOrderViewSet)
router.register(r"blog", blog_views.PostViewSet)
router.register(r"events", event_views.EventsViewSet, "event")

# TODO: Clean this up by importing from app's urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/csrf/", user_views.set_csrf_token),
    path("api/register/", user_views.RegisterView.as_view()),
    path("api/api-auth/", include(api_auth_urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# TODO: uncomment to allow for .json url suffixes
# urlpatterns = format_suffix_patterns(urlpatterns)
