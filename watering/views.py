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
        print(battery_history)
        # Multiply battery by 100
        for battery in battery_history:
            battery["value_old"] = round(battery["value_old"] * 100, 2) if battery["value_old"] is not None else None
            battery["value_new"] = round(battery["value_new"] * 100, 2) if battery["value_new"] is not None else None

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
        watering_duration = box_watering_duration_history(box_id, start_date, now)
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


def box_watering_duration_history(box_id, fromDate, to):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.watering_duration_history(
        box_id=box.data["id"],
        fromDate=fromDate,
        to=to
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


def box_monthly_report_data(request):
    _now = datetime.datetime.now().isoformat()

    start_date = datetime.datetime.now() - datetime.timedelta(30)
    start_date = start_date.isoformat()

    # get consumption historic data
    try:
        consumption_history = WateringBox.consumption_history_list_values(from_date=start_date, to=_now)
    except ReadTimeout:
        consumption_history = []

    # get prediction historic data
    try:
        prediction_history = WateringBox.prediction_history_list(start_date, _now)
    except ReadTimeout:
        prediction_history = []

    # get watering duration historic data
    try:
        watering_duration = WateringBox.watering_duration_history_list(start_date, _now)
    except ReadTimeout:
        watering_duration = []

    # group by entity
    by_entity = merge(
        key_field="entity_id",
        value_field="results",
        results_lists=[
            prediction_history,
            consumption_history,
            watering_duration,
        ],
        prop_names=["predictions", "consumptions", "durations"]
    )

    # for each entity, group by date
    entities_data = []
    for entity in by_entity:
        data_by_date = merge_by_date(
            results_lists=[
                entity["predictions"],
                entity["consumptions"],
                entity["durations"],
            ],
            prop_names=["prediction", "consumption", "duration"]
        )

        # ignore hour part, format metrics
        for datum in data_by_date:
            datum["date"] = datum["date"].split("T")[0]

            for prop in ["consumption", "prediction"]:
                datum[prop] = round(datum[prop], 2) if datum[prop] is not None else None

            datum["duration"] = datum["duration"] / 1000 if datum["duration"] is not None else None

        entities_data.append({
            "entity_id": entity["entity_id"],
            "box_id": entity["entity_id"].split("ld:FlowerBed:FlowerBed-")[-1],
            "data": data_by_date,
        })

    # return as json response
    return JsonResponse({
        "data": entities_data,
    })


def box_monthly_report(request):
    # get boxes for this user

    '''boxes = JsonResponse({
        "boxes": [box.data for box in WateringBox.list()]
    })'''
    boxes = WateringBox.list()

    '''# get consumption historic data
    try:
        consumption_history = WateringBox.consumption_history_list()
    except ReadTimeout:
        consumption_history = []'''

    # get watering predictions historic data
    # TODO implement prediction history, by entity id
    # try:
    #     prediction_history = merge_histories(
    #         old_history=consumption_history,
    #         new_history=prediction_history,
    #         preprocessing=None
    #     )
    # except ReadTimeout:
    #     prediction_history = []

    # render
    return render(request, 'watering/monthly-report.html', {
        'boxes': [
            box.data
            for box in boxes
        ],
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


def merge_histories(old_history, new_history, preprocessing=None):
    return merge_by_date(
        results_lists=[old_history, new_history],
        prop_names=["value_old", "value_new"],
        preprocessing=preprocessing
    )
    """
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
    """


def merge_by_date(results_lists, prop_names, preprocessing=None):
    return merge(
        key_field="date",
        value_field="value",
        results_lists=results_lists,
        prop_names=prop_names,
        preprocessing=preprocessing
    )


def merge(key_field, value_field, results_lists, prop_names, preprocessing=None):
    if len(results_lists) != len(prop_names):
        raise ValueError("Invalid prop_names parameter.")

    # check if a callable has been passed for preprocessing
    if preprocessing:
        results_lists = [
            preprocessing(result)
            for result in results_lists
        ]

    merged = {}
    for idx, results in enumerate(results_lists):
        for entry in results:

            # new entry for this key
            if entry[key_field] not in merged:
                merged[entry[key_field]] = {
                    prop_name: None
                    for prop_name in prop_names
                }

                # also add key
                merged[entry[key_field]][key_field] = entry[key_field]

            # set relevant prop
            merged[entry[key_field]][prop_names[idx]] = entry[value_field]

    # return sorted by key
    return sorted(list(merged.values()), key=lambda entry: entry[key_field])


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
