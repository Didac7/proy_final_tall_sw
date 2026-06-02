from django.urls import path
from .stats_views import GlobalStatsView

urlpatterns = [
    path('', GlobalStatsView.as_view(), name='global-stats'),
]
