import dateutil
import requests
from django.utils.timezone import now

from naiades_watering.settings import KSI_ENDPOINT, KSI_SECRET


class KSIError(ValueError):
    pass


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

    @staticmethod
    def get_signed_data(data):
        # post request to KSI service
        response = requests.post(
            f"{KSI_ENDPOINT}/sign/",
            json={
                "secret": KSI_SECRET,
                "data": data,
            }
        )

        if response.status_code != 200:
            raise KSIError()

        # return signed data
        return response.json()["signed_data"]

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
            data=self.get_signed_data(data),
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
            data=self.get_signed_data(data),
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

    def last_watering_date_history(self, service, entity_id, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/entities/{entity_id}/attrs/dateLastWatering/value?fromDate={fromDate}&toDate={to}',
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

    def last_watering_date_history_list_values(self, service, from_date, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/dateLastWatering/value?fromDate={from_date}&toDate={to}',
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

    def get_connection_status(self):
        response = requests.get(
            f'http://{self.endpoint}/v2/entities/urn:ngsi-ld:Device:Truck',
            headers=self.get_headers(service="carouge"),
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # parse & check if not more than a minute
        # between current date & last observed date
        data = response.json()
        current_date = dateutil.parser.isoparse(data["currentDate"]["value"])
        date_observed = dateutil.parser.isoparse(data["dateObserved"]["value"])

        return (
            abs((current_date - date_observed).total_seconds()) <= 60 and
            abs((now() - current_date).total_seconds()) <= 60
        )

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
            f'http://{self.endpoint}/v2/entities/?type=Device&idPattern=^urn:ngsi-ld:Device:Device-&options=keyValues&limit=50',
            headers=self.get_headers(service=service)
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def get_device(self, service, device_id):
        # list entities
        response = requests.get(
            f'http://{self.endpoint}/v2/entities/{device_id}/',
            headers=self.get_headers(service=service),
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        # return list
        return response.json()

    def put_device_status(self, service, device_id, status):
        # change device status
        response = requests.post(
            f'http://{self.endpoint}/v2/entities/{device_id}/attrs?options=keyValues',
            headers=self.get_headers(service=service),
            json={
                "deviceState": status,
            },
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

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
            data=self.get_signed_data({
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
            }),
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)
