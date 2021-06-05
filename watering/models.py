from decimal import Decimal

import requests
import json

import dateutil.parser
from datetime import datetime, timedelta

from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField, DateTimeField, BooleanField, SET_NULL, ForeignKey, TextField, \
    DecimalField, Q
from django.utils.timezone import now


class OrionError(ValueError):
    pass


class BoxAlreadyExists(OrionError):
    pass


class OrionEntity(object):
    endpoint = '5.53.108.182:1026'
    history_endpoint = '5.53.108.182:8668'

    def get_headers(self, service):
        headers = {}

        if service == "carouge":
            headers.update({
                'Fiware-Service': service,
            })
        if service == "Attr":
            headers.update({
                'Fiware-Service': 'carouge',
                'Content-Type': 'text/plain',
            })

        return headers

    @staticmethod
    def handle_error(response):
        exception = None

        # check if known error type must be thrown
        try:
            response = response.json()
            if response.get("error", "").lower() == "unprocessable" and \
                    response.get("description", "").lower() == "already exists":
                exception = BoxAlreadyExists()
        except:
            response = response.content

        # raise specific exception if detected
        if exception:
            raise exception

        # raise generic exception
        raise OrionError(response)

    def list(self, service):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities?options=keyValues&type=FlowerBed',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def create(self, service, data):
        response = requests.post(
            f'http://{self.endpoint}/v2/entities/?options=keyValues',
            headers=self.get_headers(service=service),
            json=data,
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

    def delete(self, service, box_id):
        response = requests.delete(
            f'http://{self.endpoint}/v2/entities/urn:ngsi-ld:FlowerBed:FlowerBed-{box_id}',
            headers=self.get_headers(service=service),
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

    def update(self, service, entity_id, data):
        response = requests.patch(
            f'http://{self.endpoint}/v2/entities/{entity_id}/attrs?options=keyValues',
            headers=self.get_headers(service=service),
            json=data,
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

    def history(self, service, entity_id, attr, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/entities/urn:ngsi-ld:Device:Device-{entity_id}/attrs/{attr}?fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def consumption_history(self, service, entity_id, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/entities/{entity_id}/attrs/consumption/value?aggrMethod=avg&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def prediction_history(self, service, entity_id, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/entities/{entity_id}/attrs/nextWateringAmountAdvice/value?aggrMethod=avg&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def watering_duration_history(self, service, entity_id, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/entities/{entity_id}/attrs/duration/value?aggrMethod=avg&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def consumption_history_list_values(self, service, from_date, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/consumption/value?aggrMethod=avg&aggrPeriod=day&fromDate={from_date}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def prediction_history_list(self, service, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/nextWateringAmountAdvice/value?aggrMethod=avg&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def watering_duration_history_list(self, service, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/duration/value?aggrMethod=avg&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def truck_location_history(self, service, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/truckLocation/value?fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def consumption_history_list(self):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/consumption',
            headers={
                'Fiware-Service': 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        ),

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response

    def sensor_list(self, service):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities/?type=Device&options=keyValues',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def weather_observed(self, service):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities/urn:ngsi-ld:WeatherObserved:WeatherObserved/',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return weather observed
        return response.json()

    def weather_forecast(self, service):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities/?type=WeatherForecast',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return weather forecast
        return response.json()

    def subscribe(self, service, watering_server):
        # create subscription
        response = requests.post(
            f'http://{self.endpoint}/v2/subscriptions/',
            headers=self.get_headers(service=service),
            json={
                "description": "Naiades Watering App Subscription to `FlowerBed.consumption`.",
                "subject": {
                    "entities": [
                        {
                            "idPattern": ".*",
                            "type": "FlowerBed"
                        }
                    ],
                    "condition": {
                        "attrs": [
                            "consumption"
                        ]
                    }
                },
                "notification": {
                    "http": {
                        "url": f"{watering_server}/consumptions/"
                    },
                    "attrs": [
                        "consumption"
                    ],
                    "attrsFormat": "keyValues"
                },
            }
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)


class WateringBox(Model):
    """
    Information about a watering box, saved locally
    TODO migrate to API
    """
    id = CharField(max_length=16, primary_key=True, db_index=True)
    data = JSONField(blank=True, default=dict)

    service = 'carouge'
    type = 'FlowerBed'

    @property
    def can_be_deleted(self):
        return self.id not in [str(_id) for _id in range(1, 9)]

    @staticmethod
    def get(box_id):
        try:
            return [
                box
                for box in WateringBox.list()
                if box.id == box_id
            ][0]
        except IndexError:
            raise WateringBox.DoesNotExist()

    @staticmethod
    def is_setup(data):
        return data.get("flowerType") and data.get("sunExposure")

    @staticmethod
    def status_from_watering_date(watering_date):
        # handle empty
        if not watering_date:
            return 'UNKNOWN'

        # parse
        try:
            date = datetime.strptime(
                watering_date.split('T')[0],
                '%Y-%m-%d'
            ).date()
        except ValueError:
            return 'UNKNOWN'

        # get current date
        today = now().date()

        # check if past
        if date < today:
            return 'UNKNOWN'

        # check if any of the upcoming days
        for delta, status in [(0, 'TODAY'), (1, 'TOMORROW'), (2, 'DAY_AFTER_TOMORROW')]:
            if today + timedelta(days=delta) == date:
                return status

        # fallback - day is in future
        return 'FUTURE'

    @staticmethod
    def format_location(location_str_list):
        return [
            {
                "lat": float(location_str.split(",")[1].strip()),
                "long": float(location_str.split(",")[0].strip()),
            }
            for location_str in location_str_list
        ]

    @staticmethod
    def extract_values_from_dicts(data):
        value_keys = ["value", "coordinates"]

        # extract from type/value dicts
        for prop in data:

            # ignore non-dicts
            if type(data[prop]) != dict:
                continue

            # try all value keys
            for value_key in value_keys:
                if value_key in data[prop]:
                    data[prop] = data[prop][value_key]
                    break

        return data

    @staticmethod
    def prepare(data, sensor=None):
        # include extra attributes
        data["isSetup"] = WateringBox.is_setup(data)

        for source_prop, target_prop in [
            ("dateLastWatering", "lastWatering"),
            ("nextWateringDeadline", "nextWatering"),
        ]:
            if source_prop in data:
                data[target_prop] = WateringBox.status_from_watering_date(data[source_prop])
            else:
                data[target_prop] = "UNKNOWN"

        # add & format
        if "location" in data:
            data["location"] = WateringBox.format_location(data["location"])

        # add sensor info
        data["sensor"] = sensor

        # set soil type & number of boxes from category field
        if "category" in data:
            category = data.pop("category")

            try:
                data["soil_type"] = category[0]
                data["number_of_boxes"] = int(category[1].split(" ")[1])
            except (IndexError, ValueError):
                pass

    @staticmethod
    def list():
        # list flowerbeds in Orion
        # filter only flowerbed entities
        flowerbeds = [
            entity
            for entity in OrionEntity().list(service=WateringBox.service)
            if entity["type"] == WateringBox.type
        ]

        # get sensors by id
        sensors_idx = {
            sensor["serialNumber"]: WateringBox.extract_values_from_dicts(data=sensor)
            for sensor in Sensor.list()
        }

        # create WateringBox instances
        boxes = []
        for flowerbed in flowerbeds:
            # get entity id
            try:
                # extract values from type/value dicts
                flowerbed = WateringBox.extract_values_from_dicts(data=flowerbed)

                # get box id
                box_id = flowerbed.get("boxId") or flowerbed["id"].split("urn:ngsi-ld:FlowerBed:FlowerBed-")[1]

                # update in flowerbed
                flowerbed["boxId"] = box_id

                # add dates & setup
                WateringBox.prepare(
                    flowerbed,
                    sensor=sensors_idx.get(flowerbed.get("refDevice", ""))
                )

                # add instance
                boxes.append(WateringBox(
                    id=box_id,
                    data=flowerbed
                ))
            except:
                print(f"Invalid flowerbed: {str(flowerbed)}")

        return boxes

    @staticmethod
    def post(box_id, data):
        if not box_id:
            return OrionEntity().create(
                service=WateringBox.service,
                data=data
            )

        # update box id
        OrionEntity().update(
            service=WateringBox.service,
            entity_id=box_id,
            data=data
        )

    @staticmethod
    def delete(box_id):
        return OrionEntity().delete(
            service=WateringBox.service,
            box_id=box_id
        )

    @staticmethod
    def history(refDevice, attr, fromDate, to):
        # get humidity history of refDevice
        try:
            response = OrionEntity().history(
                service=WateringBox.service,
                entity_id=refDevice,
                attr=attr,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        results = []
        for idx, index in enumerate(response["index"]):
            results.append({
                "date": index,
                "value": response["values"][idx],
            })

        return results

    @staticmethod
    def consumption_history(box_id, fromDate, to):
        # get humidity history of box id
        try:
            response = OrionEntity().consumption_history(
                service=WateringBox.service,
                entity_id=box_id,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        results = []
        for idx, index in enumerate(response["index"]):
            results.append({
                "date": index,
                "value": response["values"][idx],
            })

        return results

    @staticmethod
    def prediction_history(box_id, fromDate, to):
        # get prediction history of box id
        try:
            response = OrionEntity().prediction_history(
                service=WateringBox.service,
                entity_id=box_id,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        results = []
        for idx, index in enumerate(response["index"]):
            results.append({
                "date": index,
                "value": response["values"][idx],
            })

        return results

    @staticmethod
    def watering_duration_history(box_id, fromDate, to):
        # get watering duration history of box id
        try:
            response = OrionEntity().watering_duration_history(
                service=WateringBox.service,
                entity_id=box_id,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        results = []
        for idx, index in enumerate(response["index"]):
            results.append({
                "date": index,
                "value": response["values"][idx],
            })

        return results

    @staticmethod
    def format_list_response(response):
        values = []
        for value in response["values"]:
            value_item = {
                "entity_id": value["entityId"],
                "results": []
            }
            for idx, index in enumerate(value["index"]):
                value_item["results"].append({
                    "date": index,
                    "value": value["values"][idx],
                })

            values.append(value_item)

        return values

    @staticmethod
    def prediction_history_list(fromDate, to):
        # get prediction history of box id
        try:
            response = OrionEntity().prediction_history_list(
                service=WateringBox.service,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        return WateringBox.format_list_response(response)

    @staticmethod
    def watering_duration_history_list(fromDate, to):
        # get watering duration history of box id
        try:
            response = OrionEntity().watering_duration_history_list(
                service=WateringBox.service,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        return WateringBox.format_list_response(response)

    @staticmethod
    def truck_location_history(fromDate, to):
        # get truck location history of box id
        try:
            response = OrionEntity().truck_location_history(
                service=WateringBox.service,
                fromDate=fromDate,
                to=to
            )
        except OrionError:
            return []

        results = []
        for idx, index in enumerate(response["index"]):
            results.append({
                "date": index,
                "value": response["values"][idx],
            })

        return results

    @staticmethod
    def consumption_history_list():
        # get humidity history of box id
        try:
            return WateringBox.format_list_response(OrionEntity().consumption_history_list())
        except OrionError:
            return []


    @staticmethod
    def consumption_history_list_values(from_date, to):
        # get humidity history of box id
        try:
            return WateringBox.format_list_response(OrionEntity().consumption_history_list_values(
                service=None,
                from_date=from_date,
                to=to
            ))
        except OrionError:
            return []

    @staticmethod
    def sensors_list():
        # list flowerbeds in Orion
        # filter only flowerbed entities
        flowerbeds = [
            entity
            for entity in OrionEntity().list(service=WateringBox.service)
            if entity["type"] == WateringBox.type
        ]

        # create WateringBox instances
        sensors = {}

        for flowerbed in flowerbeds:
            # flatten value/type dicts
            flowerbed = WateringBox.extract_values_from_dicts(data=flowerbed)

            # get sensor Id
            ref_device = flowerbed.get("refDevice")

            # link with flowerbed
            if ref_device is not None:
                try:
                    sensors[ref_device] = str(int(flowerbed["id"].split("-")[-1]))
                except ValueError:
                    sensors[ref_device] = flowerbed["id"]

        return sensors


class Issue(Model):
    """
    Issue reported about a specific box
    """
    box_id = CharField(max_length=64, db_index=True)
    issue_type = CharField(max_length=1024)
    created = DateTimeField(auto_now_add=True)
    updated = DateTimeField(auto_now=True)
    resolved = BooleanField(default=False)
    submitted_by = ForeignKey('auth.User', on_delete=SET_NULL, blank=True, null=True)
    description = TextField()


class Sensor(Model):
    """
    Information about a sensor, saved locally
    TODO migrate to API
    """
    id = CharField(max_length=16, primary_key=True, db_index=True)
    serialNumber = CharField(max_length=16, db_index=True)

    data = JSONField(blank=True, default=dict)

    service = 'carouge'

    @staticmethod
    def get(sensor_id):
        try:
            return [
                sensor
                for sensor in Sensor.list()
                if sensor.id == sensor_id
            ][0]
        except IndexError:
            raise Sensor.DoesNotExist()

    @staticmethod
    def list():
        # list flowerbeds in Orion
        # filter only flowerbed entities
        sensors = [
            entity
            for entity in OrionEntity().sensor_list(service=Sensor.service)
        ]

        return sensors

    @staticmethod
    def get_device(refDevice):
        try:
            return [
                sensor
                for sensor in Sensor.list()
                if sensor["serialNumber"] == refDevice
            ][0]
        except IndexError:
            raise Sensor.DoesNotExist()


class Weather(Model):
    """
    Information about weather
    """
    data = JSONField(blank=True, default=dict)

    @staticmethod
    def get_weather_observed():

        weather = OrionEntity().weather_observed(service='carouge')
        return weather

    @staticmethod
    def get_weather_forecast():
        weather = OrionEntity().weather_forecast(service='carouge')
        return weather


class EventParseError(ValueError):
    """
    Exception raised when an event can not be parsed
    """
    pass


class Event(Model):
    """
    Watering event
    """
    box_id = CharField(max_length=64, db_index=True)
    created = DateTimeField(auto_now_add=True)
    start_date = DateTimeField()
    end_date = DateTimeField()
    consumption = DecimalField(max_digits=12, decimal_places=4)
    extra_data = JSONField(blank=True, default=dict)

    @staticmethod
    def consume_event_data(data):
        # parse
        try:
            box_id = data["id"]
            start_date = dateutil.parser.isoparse(data["initDate"]["value"])
            end_date = dateutil.parser.isoparse(data["endDate"]["value"])
            consumption = Decimal(data["consumption"]["value"])
        except (KeyError, ValueError):
            raise EventParseError()

        # get or create event
        event = Event.objects.\
            filter(
                box_id=box_id,
                start_date__lte=start_date,
                start_date__gt=(start_date - timedelta(hours=1))
            ).\
            first()

        if not event:
            event = Event(
                box_id=box_id,
                start_date=start_date,
                consumption=0,
                extra_data={
                    "messages": []
                }
            )

        # set end time & consumption
        event.end_date = end_date
        event.consumption += consumption

        # add message & save
        event.extra_data["messages"].append(data)
        event.save()

    @staticmethod
    def consume_event(payload):
        # process all events in payload
        for event_data in (payload or {}).get("data", []):
            Event.consume_event_data(data=event_data)

    @staticmethod
    def fetch(box_id):
        # load from db
        events = Event.objects.\
            filter(Q(box_id=box_id) | Q(box_id__endswith=f'-{box_id}')).\
            filter(start_date__gt=now() - timedelta(hours=1))

        # return serialized
        return [
            {
                "event_id": event.pk,
                "consumption": "%.4f" % event.consumption,
            }
            for event in events
        ]
