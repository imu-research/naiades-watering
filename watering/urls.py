from django.urls import path

from watering import views


urlpatterns = [
    # home
    path('', views.home, name='home'),

    # Box Details
    path('details/', views.box_details, name='box-details'),
    path('details/<str:metric>/', views.box_details_metric, name='box-details-metric'),

    # Cluster Details
    path('cluster/', views.cluster_details, name='cluster-details'),

    # Monthly Report
    path('monthlyReport/data/', views.box_monthly_report_data, name='monthly-report-data'),
    path('monthlyReport/distances/', views.box_monthly_report_distances, name='monthly-report-distances'),
    path('monthlyReport/', views.box_monthly_report, name='monthly-report'),

    # Daily Report
    path('dailyReport/', views.box_daily_report, name='daily-report'),


    # Report issues
    path('box/<str:box_id>/issues/report/', views.report_issue, name='report-issue'),
    path('box/<str:box_id>/issues/', views.list_issues, name='list-issues'),

    # Boxes API
    path('api/boxes/list', views.box_api_list, name='box-api-list'),
    path('api/boxes/<str:box_id>/delete/', views.box_api_delete, name='box-api-delete'),
    path('api/boxes/<str:box_id>/start-watering/', views.box_api_start_watering, name='box-api-start-watering'),
    path('api/boxes/<str:box_id>/dry-plants-feedback/', views.box_api_dry_plants_feedback, name='box-api-dry-plants'),
    path('api/boxes/<str:box_id>/no-watering-feedback/', views.box_api_no_watering_feedback, name='box-api-no-watering'),

    # List View
    path('route/', views.route_view, name='route'),

    # Create and Update Box
    path('boxes/create/', views.box_create, name='box-create'),
    path('edit/', views.box_edit, name='box-edit'),

    # Box Watered
    path('watered/', views.box_watered, name='box-watered'),

    # Subscription callback
    path('consumptions/', views.consumptions_create, name='consumptions-create'),

    # Sensors API
    path('api/sensor/<str:refNewDevice>/details', views.sensor_api_details, name='sensor-api-details'),

    # Weather API
    path('api/weather/', views.weather, name='api-weather'),

    # Connection status
    path('api/connection/status', views.get_connection_status, name='api-connection-status'),
]
