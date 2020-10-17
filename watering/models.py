import requests

from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField, DateTimeField, BooleanField, SET_NULL, ForeignKey, TextField


class OrionError(ValueError):
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

    def list(self, service):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities?options=keyValues&type=FlowerBed',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            raise OrionError(response.content)

        # return list
        return response.json()

    def create(self, service, data):
        response = requests.patch(
            f'http://{self.endpoint}/v2/entities/?options=keyValues',
            headers=self.get_headers(service=service),
            json=data,
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            raise OrionError(response.content)

    def update(self, service, entity_id, data):
        response = requests.patch(
            f'http://{self.endpoint}/v2/entities/{entity_id}/attrs?options=keyValues',
            headers=self.get_headers(service=service),
            json=data,
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            raise OrionError(response.content)


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
            raise OrionError(response.content)

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
            raise OrionError(response.content)

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
            box_id = flowerbed.get("boxId") or flowerbed["id"].split("urn:ngsi-ld:FlowerBed:FlowerBed-")[1]

            # update in flowerbed
            flowerbed["boxId"] = box_id

            # add instance
            boxes.append(WateringBox(
                id=box_id,
                data=flowerbed
            ))

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
        sensors = []

        for flowerbed in flowerbeds:
            # get sensor Id
            refDevice = flowerbed.get("refDevice")

            if refDevice or refDevice == 0:
                sensors.append(refDevice)

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