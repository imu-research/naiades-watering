import json
import datetime

from django.http import JsonResponse
from django.shortcuts import render
from requests import ReadTimeout

from watering.models import WateringBox, Sensor
from watering.utils import merge_histories, preprocessed_history

from .base_edit import base_box_edit


def box_details(request):
    # get box id
    box_id = request.GET.get("id")

    # find box
    box = WateringBox.get(box_id)

    now = datetime.datetime.now().isoformat()

    start_date = datetime.datetime.now() - datetime.timedelta(30)
    start_date = start_date.isoformat()

    form = base_box_edit(request, box=box)

    # render
    return render(request, 'watering/details.html', {
        'id': box_id,
        'box': box,
        'form': form,
        'sensors': Sensor.list(),
        'connected_sensors': WateringBox.sensors_list(),
    })


class InvalidMetricError(ValueError):
    pass


def get_prediction_logs(box_id, start_date, end_date):
    # get consumption historic data
    try:
        consumption_history = box_preprocessing_consumption_data(box_id, start_date, end_date)
    except ReadTimeout:
        consumption_history = []

    # get prediction historic data
    try:
        prediction_history = box_prediction_history(box_id, start_date, end_date)
    except ReadTimeout:
        prediction_history = []

    # get watering duration historic data
    try:
        watering_duration = box_preprocessing_duration_data(box_id, start_date, end_date)
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

    return {
        "prediction": prediction_history,
        "logs": watering_logs_history,
    }


def get_metric_data(box_id, metric, start_date, end_date):
    if metric == "history":
        return merge_histories(
            old_history=box_history(box_id, "refDevice", "value", start_date, end_date),
            new_history=box_history(box_id, "refNewDevice", "value", start_date, end_date),
            preprocessing=preprocessed_history
        )

    if metric == "prediction":
        return get_prediction_logs(box_id, start_date, end_date)

    if metric == "ec-history":
        return box_history(box_id, "refNewDevice", "soilMoistureEc", start_date, end_date)

    if metric == "soil-history":
        return box_history(box_id, "refNewDevice", "soilTemperature", start_date, end_date)

    if metric == "battery":
        data = merge_histories(
            old_history=box_history(box_id, "refDevice", "batteryLevel", start_date, end_date),
            new_history=box_history(box_id, "refNewDevice", "batteryLevel", start_date, end_date),
            preprocessing=preprocessed_history
        )

        # multiply each battery by 100
        for battery in data:
            battery["value_old"] = round(battery["value_old"] * 100, 2) if battery["value_old"] is not None else None
            battery["value_new"] = round(battery["value_new"] * 100, 2) if battery["value_new"] is not None else None

        return data

    raise InvalidMetricError()


def box_details_metric(request, metric):
    # get box id
    box_id = request.GET.get("id")

    # get time window
    now = datetime.datetime.now().isoformat()

    start_date = datetime.datetime.now() - datetime.timedelta(30)
    start_date = start_date.isoformat()

    try:
        data = get_metric_data(
            box_id=box_id,
            metric=metric,
            start_date=start_date,
            end_date=now,
        )
    except ReadTimeout:
        data = []
    except InvalidMetricError:
        return JsonResponse({
            "error": f"Invalid metric: {metric}."
        }, status=400)

    return JsonResponse(data, safe=False)


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


def box_last_watering_date_history(box_id, fromDate, to):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.last_watering_date_history(
        box_id=box.data["id"],
        fromDate=fromDate,
        to=to
    )

    # render
    return historic_data


def box_history(box_id, ref_device_attr, attr, fromdate, to):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.history(
        refDevice=box.data[ref_device_attr][-4:],
        attr=attr,
        fromDate=fromdate,
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


def box_preprocessing_duration_data(box_id, fromDate, to):

    duration_history = box_watering_duration_history(box_id, fromDate, to)
    last_watering_date_history = box_last_watering_date_history(box_id, fromDate, to)
    historic_data = []
    watering_dates = list(set([date["value"] for date in last_watering_date_history]))
    print(watering_dates)

    for idx, entry in enumerate(duration_history):
        if entry['date'] in watering_dates:
            historic_data.append(entry)
        else:
            historic_data.append({
                "date": entry['date'],
                "value": 0
            })

    return historic_data


def box_preprocessing_consumption_data(box_id, fromDate, to):

    consumption_history = box_consumption_history(box_id, fromDate, to)
    last_watering_date_history = box_last_watering_date_history(box_id, fromDate, to)
    historic_data = []
    watering_dates = list(set([date["value"] for date in last_watering_date_history]))
    print(watering_dates)

    for idx, entry in enumerate(consumption_history):
        if entry['date'] in watering_dates:
            historic_data.append(entry)
        else:
            historic_data.append({
                "date": entry['date'],
                "value": 0
            })

    return historic_data
