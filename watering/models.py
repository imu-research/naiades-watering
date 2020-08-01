import requests

from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField


class OrionError(ValueError):
    pass


class OrionEntity(object):
    endpoint = '5.53.108.182:1026'

    def get_headers(self, service):
        headers = {}

        if service:
            headers.update({
                'Fiware-Service': service,
            })

        return headers

    def list(self, service):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities?options=keyValues',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            raise OrionError(response.content)

        # return list
        return response.json()

    def update(self, service, entity_id, data):
        response = requests.patch(
            f'http://{self.endpoint}/v2/entities/{entity_id}/attrs?options=keyValues',
            headers=self.get_headers(service=service),
            json=data,
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            raise OrionError(response.content)


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
            box_id = flowerbed["boxId"] or flowerbed["id"].split("urn:ngsi-ld:FlowerBed:FlowerBed-")[1]

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
        # update box id
        OrionEntity().update(
            service=WateringBox.service,
            entity_id=box_id,
            data=data
        )
