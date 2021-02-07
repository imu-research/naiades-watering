from django.urls import path

from watering import views


urlpatterns = [
    # home
    path('', views.home, name='home'),

    # Box Details
    path('details/', views.box_details, name='box-details'),

    # Report issues
    path('box/<str:box_id>/issues/report/', views.report_issue, name='report-issue'),
    path('box/<str:box_id>/issues/', views.list_issues, name='list-issues'),

    # Boxes API
    path('api/boxes/list', views.box_api_list, name='box-api-list'),
    path('api/boxes/<str:box_id>/delete/', views.box_api_delete, name='box-api-delete'),
    path('api/boxes/<str:box_id>/start-watering/', views.box_api_start_watering, name='box-api-start-watering'),

    # List View
    path('route/', views.route_view, name='route'),

    # Create and Update Box
    path('boxes/create/', views.box_create, name='box-create'),
    path('edit/', views.box_edit, name='box-edit'),

    # Box Watered
    path('watered/', views.box_watered, name='box-watered'),

    # Sensors API
    path('api/sensor/<str:refDevice>/details', views.sensor_api_details, name='sensor-api-details'),

    # Weather API
    path('api/weather/', views.weather, name='api-weather'),
]
