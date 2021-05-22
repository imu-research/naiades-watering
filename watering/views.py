import datetime
import json
import logging
from _decimal import InvalidOperation

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

    now = datetime.datetime.now().isoformat()

    start_date = datetime.datetime.now() - datetime.timedelta(30)
    start_date = start_date.isoformat()


    # get humidity historic data
    try:
        history = merge_histories(
            old_history=box_history(box_id, "refDevice", "value", start_date, now),
            new_history=box_history(box_id, "refNewDevice", "value", start_date, now),
            preprocessing=preprocessed_history
        )

        battery_history = merge_histories(
            old_history=box_history(box_id, "refDevice", "batteryLevel", start_date, now),
            new_history=box_history(box_id, "refNewDevice", "batteryLevel", start_date, now),
            preprocessing=preprocessed_history
        )

        ec_history = box_history(box_id, "refNewDevice", "soilMoistureEc", start_date, now)
        soil_temp_history = box_history(box_id, "refNewDevice", "soilTemperature", start_date, now),

        # history_old = history_preprocessing(history_old_api)
        # history = history_preprocessing(history_new_api)
        '''for h in history_old:
            history.append({"date":h['date'], "value2":h['value']})'''
    except ReadTimeout:
        history = []
        battery_history = []
        ec_history = []
        soil_temp_history = []

    # get consumption historic data
    try:
        consumption_history = box_consumption_history(box_id, start_date, now)
    except ReadTimeout:
        consumption_history = []

    # get prediction historic data
    try:
        prediction_history = box_prediction_history(box_id, start_date, now)
    except ReadTimeout:
        prediction_history = []

    # get watering duration historic data
    try:
        watering_duration = box_watering_duration_history(box_id)
    except ReadTimeout:
        watering_duration = []

    # get watering predictions historic data
    try:
        prediction_history = merge_histories(
            old_history=consumption_history,
            new_history=prediction_history,
            preprocessing=None
        )
    except ReadTimeout:
        prediction_history = []

    # get watering logs historic data
    try:
        watering_logs_history = merge_histories(
            old_history=consumption_history,
            new_history=watering_duration,
            preprocessing=None
        )
    except ReadTimeout:
        watering_logs_history = []

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
        'battery_history': json.dumps(battery_history),
        'ec_history': json.dumps(ec_history),
        'soil_temp_history': json.dumps(soil_temp_history),
        'prediction_history': json.dumps(prediction_history),
        'watering_logs_history': watering_logs_history,

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
            print(issue)

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


def box_history(box_id, ref_device_attr, attr, fromdate, to):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.history(
        refDevice=box.data[ref_device_attr][-4:],
        attr=attr,
        fromDate=fromdate,
        to=to
    )

    #if attr == "batteryLevel":

    # render
    return historic_data


def box_consumption_history(box_id, fromDate, to):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.consumption_history(
        box_id=box.data["id"],
        fromDate=fromDate,
        to=to
    )

    # render
    return historic_data


def box_watering_duration_history(box_id):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.watering_duration_history(
        box_id=box.data["id"]
    )

    # render
    return historic_data


def box_prediction_history(box_id, fromDate, to):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.prediction_history(
        box_id=box.data["id"], fromDate=fromDate, to=to
    )

    # render
    return historic_data


def box_truck_location_history(box_id):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.truck_location_history(
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

    # calculate recommended per box
    try:
        recommended = Decimal(box.data.get("nextWateringAmountRecommendation"))
    except InvalidOperation:
        recommended = 0

    n_boxes = int(box.data.get("number_of_boxes"))

    try:
        recommended_per_cluster = recommended * n_boxes
    except ZeroDivisionError:
        recommended_per_cluster = None

    # render
    return render(request, 'watering/cluster-details.html', {
        'id': box_id,
        'box': box,
        'recommended_consumption': recommended,
        'number_of_boxes': n_boxes,
        'recommended_consumption_per_cluster': recommended_per_cluster,
    })

def box_monthly_report(request):


    # get boxes for this user

    '''boxes = JsonResponse({
        "boxes": [box.data for box in WateringBox.list()]
    })'''
    boxes = WateringBox.list()

    # get consumption historic data
    try:
        consumption_history = WateringBox.consumption_history_list()
    except ReadTimeout:
        consumption_history = []

    # render
    return render(request, 'watering/monthly-report.html', {
        'boxes': [
            box.data
            for box in boxes
        ],
        'consumption_history': consumption_history,
    })

def box_daily_report(request):


    # get boxes for this user
    boxes = WateringBox.list()


    # render
    return render(request, 'watering/daily-report.html', {
        'boxes': [
            box.data
            for box in boxes
        ],
    })


def merge_histories(old_history, new_history, preprocessing=None):
    # check if a callable has been passed for preprocessing
    if preprocessing:
        old_history = preprocessing(old_history)
        new_history = preprocessing(new_history)

    # key/value pairs for old history
    history = {
        entry["date"]: {
            "value_old": entry["value"],
            "value_new": None,
        }
        for entry in old_history
    }

    # add new history values
    for entry in new_history:
        if entry["date"] not in history:
            history[entry["date"]] = {
                "value_old": None,
                "value_new": None,
            }

        history[entry["date"]]["value_new"] = entry["value"]

    # flatten & return
    return sorted([
        {
            "date": entry_date,
            "value_old": entry["value_old"],
            "value_new": entry["value_new"],
        }
        for entry_date, entry in history.items()
    ], key=lambda entry: entry["date"])


def preprocessed_history(history):
    preprocessed = []
    previous_humidity = None

    for idx, entry in enumerate(history):
        if idx > 0:
            preprocessed.append({
                "date": entry['date'],
                "value": previous_humidity
            })

        preprocessed.append(entry)
        previous_humidity = entry['value']

    # add an entry for right now, with previous humidity
    preprocessed.append({
        "date": now().strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "value": previous_humidity
    })

    return preprocessed
