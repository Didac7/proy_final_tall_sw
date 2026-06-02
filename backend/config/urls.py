"""
URL configuration para la Plataforma ICPC UAGRM.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include('apps.users.urls_users')),
    path('api/roles/', include('apps.users.urls_roles')),
    path('api/problems/', include('apps.problems.urls')),
    path('api/contests/', include('apps.contests.urls')),
    path('api/submissions/', include('apps.submissions.urls')),
    path('api/teams/', include('apps.teams.urls')),
    path('api/trainings/', include('apps.trainings.urls')),
    path('api/stats/global/', include('apps.submissions.stats_urls')),
    path('api/stats/me/', include('apps.submissions.stats_urls_user')),
]
