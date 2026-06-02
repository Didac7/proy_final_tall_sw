from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingViewSet

router = DefaultRouter()
router.register('', TrainingViewSet, basename='trainings')
urlpatterns = [path('', include(router.urls))]
