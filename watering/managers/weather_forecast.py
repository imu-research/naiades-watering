from datetime import timedelta

import requests
from django.utils.timezone import now


class WeatherForecastUpdateError(ValueError):

    def __init__(self, response):
        self.response = response

    def __str__(self):
        return f"Weather Forecast Error {self.response.status_code}: {self.response.content}"


class WeatherForecastManager(object):

    FORECAST_SERVICE_ENDPOINT = "http://5.53.108.182:1026"
    UPDATE_INTERVAL_MINUTES = 60

    @staticmethod
    def _parse_forecast_data(data):
        return {
            key: value["value"] if type(value) == dict else value
            for key, value in data.items()
            if key != "ksiSignature"
        }

    def _get_forecast_data(self, day, hour):
        # request latest weather forecast
        response = requests.get(
            url=(
                f"{self.FORECAST_SERVICE_ENDPOINT}/"
                f"v2/entities/urn:ngsi-ld:WeatherForecast:"
                f"WeatherForecast-Day{day}-{hour // 6}/"
            ),
            headers={
                "Fiware-Service": "carouge",
            }
        )

        # handle errors
        if response.status_code >= 400:
            raise WeatherForecastUpdateError(response=response)

        return self._parse_forecast_data(data=response.json())

    def run(self, n_days=3):
        from watering.models import WeatherForecast

        for day in range(0, n_days):
            for hour in [0, 6, 12, 18]:
                # get forecast data
                forecast_data = self._get_forecast_data(day=day, hour=hour)

                forecast_key = {
                    "date": now().date() + timedelta(days=day),
                    "hour": hour,
                }

                # insert or update
                forecast = WeatherForecast.objects.\
                    filter(**forecast_key).\
                    first()

                if not forecast:
                    forecast = WeatherForecast(**forecast_key)

                forecast.data = forecast_data
                forecast.save()

    def get_daily_values(self, prop, date=None):
        from watering.models import WeatherForecast

        date = date or now().date()

        # refresh forecast data
        try:
            # get update date
            updated_at = WeatherForecast.objects.\
                order_by("-date", "-hour").\
                first().\
                updated_at

            if updated_at < now() - timedelta(minutes=self.UPDATE_INTERVAL_MINUTES):
                raise AttributeError()
        except AttributeError:
            self.run()

        return [
            {
                "date": forecast.date,
                "hour": forecast.hour,
                "value": forecast.data.get(prop),
            }
            for forecast in WeatherForecast.objects.filter(date=date).order_by("date", "hour")
        ]
