from django.urls import path
from .stats_views import UserStatsView

urlpatterns = [
    path('', UserStatsView.as_view(), name='user-stats'),
]
