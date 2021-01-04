from django.urls import path
from . import views

urlpatterns = [
    path('', views.bootstrap, name='metograms-bootstrap'),
    path('about', views.about, name='metograms-about'),
]
