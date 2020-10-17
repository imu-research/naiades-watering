from django.urls import path

from watering import views


urlpatterns = [
    # home
    path('', views.home, name='home'),

    # box
    path('boxes/create/', views.box_create, name='box-create'),

    # List View
    path('list/', views.list_view, name='box-list'),

    # Box Details
    path('details/', views.box_details, name='box-details'),

    # Map View
    path('map/', views.map_view, name='box-map'),

    # Report issues
    path('box/<str:box_id>/issues/report/', views.report_issue, name='report-issue'),
    path('box/<str:box_id>/issues/', views.list_issues, name='list-issues'),

    # Boxes list API
    path('api/boxes/list', views.box_api_list, name='box-api-list'),

    # List View
    path('route/', views.route_view, name='route'),

    # Box Edit
    path('edit/', views.box_edit, name='box-edit'),

    # Box Watered
    path('watered/', views.box_watered, name='box-watered'),
]
