from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/production/', include('apps.production.urls')),
    path('api/v1/crew/', include('apps.crew.urls')),
    path('api/v1/schedule/', include('apps.schedule.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    
    # Authentication
    path('api/auth/', include('rest_framework.urls')),
    path('api/v1/auth/', include('apps.auth.urls')),  # <-- PŘIDAT TOTO
    # Frontend SPA - Vue.js bude servírováno odsud
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    
    # Catch-all pro Vue router (SPA routing)
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)