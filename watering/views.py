import json
import logging

from decimal import Decimal
from requests import ReadTimeout

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt

from watering.forms import BoxSetupForm, BoxForm, IssueForm
from watering.models import WateringBox, Issue, Sensor, BoxAlreadyExists, Weather, Event, EventParseError

from naiades_watering.settings import DEBUG


def home(request):
    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/view.html', {
        'boxes': boxes,
        'mode': "map-list",
    })


def box_create(request):
    # get sensors
    sensors = Sensor.list()
    # Get connected sensors
    connected_sensors = WateringBox.sensors_list()

    '''available_sensors = []

    for sensor in sensors:
        if sensor["serialNumber"] not in connected_sensors:
            available_sensors.append(sensor)'''

    if request.method == "POST":
        form = BoxSetupForm(request.POST)

        # check if valid & create box
        if form.is_valid():
            # post to API
            try:
                WateringBox.post(box_id=None, data=form.as_box())

                return redirect('/watering/map/')
            except BoxAlreadyExists:
                form.add_error("box_id", "A box with this ID already exists.")

    else:
        form = BoxSetupForm()

    return render(request, 'watering/create.html', {
        'form': form,
        'sensors': sensors,
        'connected_sensors': connected_sensors
    })


def box_api_list(request):
    return JsonResponse({
        "boxes": [box.data for box in WateringBox.list()]
    })


def box_api_delete(request, box_id):
    if request.method == "GET":
        return JsonResponse({
            "error": "Invalid HTTP method."
        }, status=400)

    WateringBox.delete(box_id)

    return JsonResponse({
        "box_id": box_id,
        "status": "deleted",
    }, status=204)


def box_details(request):
    # get box id
    box_id = request.GET.get("id")

    # find box
    box = WateringBox.get(box_id)

    # get humidity historic data
    try:
        history = box_history(box_id)
    except ReadTimeout:
        history = []

    # get consumption historic data
    try:
        consumption_history = box_consumption_history(box_id)
    except ReadTimeout:
        consumption_history = []

    if request.method == "POST":
        form = BoxForm(request.POST)

        # check if valid & create box
        if form.is_valid():
            # update box
            WateringBox.post(
                box_id=box.data["id"],
                data=form.as_box()
            )

    else:
        form = BoxForm.from_box(box=box)

    # render
    return render(request, 'watering/details.html', {
        'id': box_id,
        'box': box,
        'form': form,
        'history': json.dumps(history),
        'sensors': Sensor.list(),
        'connected_sensors': WateringBox.sensors_list(),
        'consumption_history': consumption_history,
    })


def list_issues(request, box_id):
    # get issues
    # sort newest first
    issues = Issue.objects.filter(box_id=box_id).order_by('-created')

    # show issue list
    return render(request, 'watering/issues/index.html', {
        "box_id": box_id,
        "issues": issues,
    })


def report_issue(request, box_id):
    if request.method == "POST":
        form = IssueForm(request.POST, instance=None)

        if form.is_valid():
            # create new issue
            issue = form.save(commit=False)

            # fill in context
            issue.box_id = box_id
            issue.submitted_by = request.user

            # save
            issue.save()

            # return to issue list
            return redirect(reverse('list-issues', kwargs={"box_id": box_id}))
    else:
        form = IssueForm()

    return render(request, 'watering/issues/report.html', {
        "box_id": box_id,
        "form": form,
    })


def show_watering_points(request, mode):
    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/view.html', {
        'boxes': boxes,
        'mode': mode,
        'TESTING': DEBUG,
    })


def route_view(request):
    return show_watering_points(request, mode='route-list')


def box_edit(request):
    # get box id
    box_id = request.GET.get("id")

    # find box
    box = WateringBox.get(box_id)

    if request.method == "POST":
        form = BoxForm(request.POST)

        # check if valid & create box
        if form.is_valid():
            # update box
            WateringBox.post(
                box_id=box.data["id"],
                data=form.as_box()
            )

    else:
        form = BoxForm.from_box(box=box)

    # render
    return render(request, 'watering/edit.html', {
        'id': box_id,
        'box': box,
        'form': form,
        'sensors': Sensor.list(),
        'connected_sensors': WateringBox.sensors_list(),
    })


def box_history(box_id):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.history(
        box_id=box.data["id"]
    )

    # render
    return historic_data


def box_consumption_history(box_id):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.consumption_history(
        box_id=box.data["id"]
    )

    # render
    return historic_data


def box_watered(request):
    box_id = request.GET.get("id")

    last_watering = now().strftime("%Y-%m-%dT%H:%M:%S%Z")
    WateringBox.post(
        box_id="urn:ngsi-ld:FlowerBed:FlowerBed-" + box_id,
        data={"dateLastWatering": last_watering}
    )

    return JsonResponse({})


@csrf_exempt
def consumptions_create(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        payload = request.body

    # save consumption event
    try:
        Event.consume_event(payload=payload)
    except EventParseError:
        logging.warning(f"""
            Unhandled consumption data:
            {payload}
        """)

    return JsonResponse({})


def sensor_api_details(request, refDevice):
    return JsonResponse({
        "sensor":  Sensor.get_device(refDevice)
    })


def box_api_start_watering(request, box_id):
    # only accept POST requests
    if request.method != "POST":
        return JsonResponse({
            "error": f"Invalid method: only POST is allowed."
        })

    # get time
    _now = now().strftime("%Y-%m-%dT%H:%M:%SZ")

    # patch box
    WateringBox.post(
        box_id=f"urn:ngsi-ld:FlowerBed:FlowerBed-{box_id}",
        data={
            "dateLastWatering": {
                "type": "DateTime",
                "value": _now,
                "metadata": {}
            },
        }
    )

    # on test environment, create watering event
    if DEBUG:
        Event.consume_event(payload={
            "subscriptionId": "60326dae06f6591a8acedaf7",
            "data": [
                {
                    "id": f"urn:ngsi-ld:FlowerBed:FlowerBed-{box_id}",
                    "test": True,
                    "consumption": {"type": "Number", "value": 0.05, "metadata": {}},
                    "endDate": {"type": "DateTime", "value": _now, "metadata": {}},
                    "initDate": {"type": "DateTime", "value": _now, "metadata": {}},
                },
            ],
        })

    # success response
    return JsonResponse({})


def weather(request):
    # We need temperature.value, relativeHumidity.value, from source.value current_condition.icon and fcst_day_1.icon
    weather_observed = Weather.get_weather_observed()

    # We need for id "urn:ngsi-ld:WeatherForecast:WeatherForecast-Day0-1"
    # dayMaximum.value.temperature , dayMaximum.value.relativeHumidity,
    # dayMinimum.value.temperature , dayMinimum.value.relativeHumidity
    weather_forecast = Weather.get_weather_forecast()

    return JsonResponse({
        'observed': weather_observed,
        'forecasted': weather_forecast,
    })


def cluster_details(request):
    # get box id
    box_id = request.GET.get("id")

    # events?
    if request.GET.get("events"):
        return JsonResponse({
            "events": Event.fetch(box_id=box_id),
        })

    # find box
    box = WateringBox.get(box_id)

    # render
    return render(request, 'watering/cluster-details.html', {
        'id': box_id,
        'box': box,
        'recommended_consumption': Decimal(box.data.get("nextWateringAmountRecommendation")),
        'number_of_boxes': int(box.data.get("number_of_boxes")),
    })
