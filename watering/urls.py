from django.urls import path

from watering import views


urlpatterns = [
    # home
    path('', views.home, name='home'),

    # box
    path('/boxes/create/', views.box_create, name='box-create'),
]
