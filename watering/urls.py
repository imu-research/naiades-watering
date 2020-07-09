from django.urls import path

from watering import views


urlpatterns = [
    # home
    path('', views.home, name='home'),

    # box
    path('boxes/create/', views.box_create, name='box-create'),

    #List View
    path('list/', views.list_view, name='box-list'),

    #Box Details
    path('details/', views.box_details, name='box-details'),

    #Map View
    path('map/', views.map_view, name='box-map'),
]
