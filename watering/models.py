import copy

import requests

from datetime import datetime, timedelta

from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField, DateTimeField, BooleanField, SET_NULL, ForeignKey, TextField
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
            pass

        # raise specific exception if detected
        if exception:
            raise exception

        # raise generic exception
        raise OrionError(response.content)

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

    def history(self, service, entity_id):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/entities/{entity_id}/attrs/soilMoisture/value?lastN=100',
            headers={
                    'Fiware-Service': 'carouge',
                    'Fiware-ServicePath': '/',
                    }
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

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
    def prepare(data):
        data["isSetup"] = WateringBox.is_setup(data)

        for source_prop, target_prop in [
            ("dateLastWatering", "lastWatering"),
            ("nextWateringDeadline", "nextWatering"),
        ]:
            if source_prop in data:
                data[target_prop] = WateringBox.status_from_watering_date(data[source_prop])
            else:
                data[target_prop] = "UNKNOWN"

        if "location" in data:
            data["location"] = WateringBox.format_location(data["location"])

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

        # create WateringBox instances
        boxes = []

        for flowerbed in flowerbeds:
            # get entity id
            try:
                box_id = flowerbed.get("boxId") or flowerbed["id"].split("urn:ngsi-ld:FlowerBed:FlowerBed-")[1]

                # update in flowerbed
                flowerbed["boxId"] = box_id

                # add dates & setup
                WateringBox.prepare(flowerbed)

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
    def history(box_id):
        # get humidity history of box id
        try:
            response = OrionEntity().history(
                service=WateringBox.service,
                entity_id=box_id
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
            # get sensor Id
            ref_device = flowerbed.get("refDevice")

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
    box_id = CharField(max_length=16, db_index=True)
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
    serialNumber = CharField(max_length=16, primary_key=True, db_index=True)

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