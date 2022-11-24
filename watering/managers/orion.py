import dateutil
import requests
from geopy import distance
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
    dmv_endpoint = 'test.naiades-project.eu:5002'

    TRUCK_TOTAL_TIME_CALCULATED_FROM_DATE_OBSERVED = True
    TRUCK_GARAGE_LOCATION = (46.18235, 6.15095)

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
        exception_class = None

        # check if known error type must be thrown
        try:
            response = response.json()
            if response.get("error", "").lower() == "unprocessable" and \
                    response.get("description", "").lower() == "already exists":
                exception_class = BoxAlreadyExists
        except:
            response = response if type(response) == str else response.content

        # raise specific exception if detected
        if exception_class:
            raise exception_class()

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
            f'http://{self.dmv_endpoint}/v2/entities/?options=keyValues',
            headers=self.get_headers(service=service),
            json=self.get_signed_data(data),
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
        body = self.get_signed_data(data)
        response = requests.patch(
            f'http://{self.dmv_endpoint}/validation/v2/entities/{entity_id}/attrs',
            headers=self.get_headers(service=service),
            json=body,
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
            f'http://{self.history_endpoint}/v2/entities/{entity_id}/attrs/nextWateringAmountRecommendation/value?aggrMethod=max&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
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

    def next_watering_dates(self, service, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/nextWateringDeadline/value?aggrMethod=max&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
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
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/consumption/value?aggrMethod=avg&aggrPeriod=hour&fromDate={from_date}&toDate={to}',
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
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/dateLastWatering/value?aggrMethod=max&aggrPeriod=hour&fromDate={from_date}&toDate={to}',
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

    def _calculate_total_time_spent(self, event_times):
        valid_truck_hours = list(range(5, 13 + 1))

        total_time_spent = 0  # in seconds
        previous_event_time = None
        by_date = {}
        for event_time in sorted(event_times):

            if self.TRUCK_TOTAL_TIME_CALCULATED_FROM_DATE_OBSERVED and event_time.hour not in valid_truck_hours:
                continue

            if previous_event_time and event_time.date() == previous_event_time.date():
                total_time_spent += (event_time - previous_event_time).total_seconds()

                if event_time.date().strftime("%Y-%m-%d") not in by_date:
                    by_date[event_time.date().strftime("%Y-%m-%d")] = 0

                by_date[event_time.date().strftime("%Y-%m-%d")] += (event_time - previous_event_time).total_seconds()

            previous_event_time = event_time

        for date, time_spent in by_date.items():
            print("%s: %d hr %d min" % (date, time_spent // 3600, (time_spent % 3600) // 60))
        return total_time_spent

    def _filter_truck_event_times_by_location(self, response):
        min_distance_from_garage = 50  # in meters

        event_times = []
        for idx, location in enumerate(response.json()["values"]):
            if distance.geodesic(
                    self.TRUCK_GARAGE_LOCATION , location["coordinates"]
            ).meters >= min_distance_from_garage:
                event_times.append(response.json()["index"][idx])

        return event_times

    def get_truck_total_time_spent(self, service, from_date, to):
        # if specified, get total truck time spent from date observed
        # otherwise, get based on truck location
        # assuming far from the garage means truck is spending time watering
        if self.TRUCK_TOTAL_TIME_CALCULATED_FROM_DATE_OBSERVED:
            endpoint = f'http://{self.history_endpoint}/v2/entities/urn:ngsi-ld:Device:Truck/attrs/dateObserved?fromDate={from_date}&toDate={to}'
        else:
            endpoint = f'http://{self.history_endpoint}/v2/entities/urn:ngsi-ld:Device:Truck/attrs/location?fromDate={from_date}&toDate={to}&attrs=location'

        # send request
        response = requests.get(
            endpoint,
            headers={
                'Fiware-Service': service or 'carouge',
                'Fiware-ServicePath': '/',
            },
            timeout=2
        )

        # raise exception if response code is in 4xx, 5xx
        if response.status_code >= 400:
            self.handle_error(response)

        if self.TRUCK_TOTAL_TIME_CALCULATED_FROM_DATE_OBSERVED:
            # get all event times from date observed prop
            event_times = response.json()["index"]
        else:
            # find event times when truck was outside of the garage
            event_times = self._filter_truck_event_times_by_location(response=response)

        # parse event times
        event_times = [
            dateutil.parser.isoparse(event_time_raw)
            for event_time_raw in event_times
        ]

        return self._calculate_total_time_spent(event_times=event_times)

    def prediction_history_list(self, service, fromDate, to):
        # list entities
        response = requests.get(
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/nextWateringAmountRecommendation/value?aggrMethod=avg&aggrPeriod=day&fromDate={fromDate}&toDate={to}',
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
            f'http://{self.history_endpoint}/v2/types/FlowerBed/attrs/duration/value?aggrMethod=avg&aggrPeriod=hour&fromDate={fromDate}&toDate={to}',
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
            f'http://{self.history_endpoint}/v2/entities/urn:ngsi-ld:Device:Truck/attrs/location?fromDate={fromDate}&toDate={to}',
            headers={
                'Fiware-Service': service or 'carouge',
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
        data = {
                "deviceState": status,
            }
        body = self.get_signed_data(data)
        response = requests.post(
            f'http://{self.dmv_endpoint}/validation/v2/entities/{device_id}/attrs?options=keyValues',
            headers=self.get_headers(service=service),
            json=body,
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
            f'http://{self.dmv_endpoint}/v2/subscriptions/',
            headers=self.get_headers(service=service),
            json=self.get_signed_data({
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
