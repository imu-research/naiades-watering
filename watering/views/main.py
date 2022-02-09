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

from watering.forms import BoxSetupForm, IssueForm
from watering.models import WateringBox, Issue, Sensor, Weather, Event, EventParseError
from watering.managers import ReportDataManager, BoxAlreadyExists


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


def consumption_history_list(from_date, to):

    historic_data = WateringBox.consumption_history_list(
        from_date=from_date,
        to=to
    )

    # render
    return historic_data


def watering_duration_history_list(fromDate, to):

    historic_data = WateringBox.watering_duration_history_list(
        fromDate=fromDate,
        to=to
    )

    # render
    return historic_data


def prediction_history_list(fromDate, to):

    historic_data = WateringBox.prediction_history_list(
        fromDate=fromDate, to=to
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

def box_api_dry_plants_feedback(request, box_id):
    # only accept POST requests
    if request.method != "POST":
        return JsonResponse({
            "error": f"Invalid method: only POST is allowed."
        })

    # patch box
    WateringBox.post(
        box_id=f"urn:ngsi-ld:FlowerBed:FlowerBed-{box_id}",
        data={
            "feedback": {
                "type": "Text",
                "value": "Dry plants",
                "metadata": {}
            },
        }
    )

    # success response
    return JsonResponse({})

def box_api_no_watering_feedback(request, box_id):
    # only accept POST requests
    if request.method != "POST":
        return JsonResponse({
            "error": f"Invalid method: only POST is allowed."
        })

    # patch box
    WateringBox.post(
        box_id=f"urn:ngsi-ld:FlowerBed:FlowerBed-{box_id}",
        data={
            "feedback": {
                "type": "Text",
                "value": "No watering required",
                "metadata": {}
            },
        }
    )

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


def get_report_range(request):
    try:
        to_date = datetime.datetime.strptime(request.GET["to"], "%d%m%Y")
    except (KeyError, ValueError):
        to_date = datetime.datetime.now()

    try:
        from_date = datetime.datetime.strptime(request.GET["from"], "%d%m%Y")
    except (KeyError, ValueError):
        from_date = to_date - datetime.timedelta(30)

    return {
        "from": from_date,
        "to": to_date,
        "formatted": {
            "from": from_date.isoformat(),
            "to": to_date.isoformat()
        }
    }


def box_monthly_report_data(request):
    date_range = get_report_range(request=request)

    manager = ReportDataManager(date_range=date_range)

    # return as json response
    return JsonResponse({
        "data": manager.get_entities_data(),
    })


def box_monthly_report_distances(request):
    date_range = get_report_range(request=request)

    manager = ReportDataManager(date_range=date_range)

    # return as json response
    return JsonResponse({
        "distances": manager.get_distances_data(),
    })


def box_monthly_report(request):
    date_range = get_report_range(request=request)

    # get boxes for this user
    boxes = WateringBox.list()

    # retrieve issues for this period
    issues_by_box = {}
    for issue in Issue.objects.filter(created__gte=date_range["from"], created__lte=date_range["to"]):
        if issue.box_id not in issues_by_box:
            issues_by_box[issue.box_id] = []

        issues_by_box[issue.box_id].append(issue)

    # render
    return render(request, 'watering/monthly-report.html', {
        'boxes': [
            box.data
            for box in boxes
        ],
        'issues_by_box': issues_by_box,
        'start': date_range["from"].strftime("%d%m%Y"),
        'end': date_range["to"].strftime("%d%m%Y"),
    })


def box_daily_report(request):
    # get boxes for this user
    boxes = WateringBox.list()

    _now = datetime.datetime.now().isoformat()

    start_date = datetime.datetime.now() - datetime.timedelta(30)
    start_date = start_date.isoformat()

    # get consumption historic data
    try:
        consumption_history = WateringBox.consumption_history_list_values(from_date=start_date, to=_now)
    except ReadTimeout:
        consumption_history = []
    # Get the last watering value
    cons = []
    for box in consumption_history:
        try:
            results = [item for item in reversed(box['results']) if item["value"] is not None][0]
        except IndexError:
            results = None
        if results:
            value = results['value']
            cons.append({'entity_id': box['entity_id'], 'value': value})

    # calculate total watering consumption and time
    total_consumption = 0
    total_time = 0
    data = []
    for box in boxes:
        if box.data['lastWatering'] == "TODAY":
            total_consumption = total_consumption + box.data['consumption']
            total_time = total_time + box.data['duration']

            last_watering = 0
            for c in cons:
                if c["entity_id"] == box.data['id']:
                    last_watering = round(c["value"], 2)

            data.append({"box": "Box"+box.data['boxId'], "this_watering": box.data['consumption'], "last_watering": last_watering})

    # render
    return render(request, 'watering/daily-report.html', {
        'boxes': [
            box.data
            for box in boxes
        ],
        'total_consumption': total_consumption,
        'total_time': total_time,
        'graph_data': json.dumps(data),
    })
