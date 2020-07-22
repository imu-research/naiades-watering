from django.contrib.postgres.fields import JSONField
from django.db.models import Model, CharField


class WateringBox(Model):
    """
    Information about a watering box, saved locally
    TODO migrate to API
    """
    id = CharField(max_length=16, primary_key=True, db_index=True)
    data = JSONField(blank=True, default=dict)

    @staticmethod
    def get(box_id):
        return WateringBox.objects.get(id=box_id).data

    @staticmethod
    def list():
        return [
            watering_box.data
            for watering_box in WateringBox.objects.all()
        ]

    @staticmethod
    def post(form):
        watering_box, _ = WateringBox.objects.get_or_create(id=form.data["box_id"])

        # set data
        watering_box.data = {
            "address": {
                "addressCountry": "Switzerland",
                "adressLocality": "Carouge",
                "streetAddress": form.data["address"],
                "location": {
                    "latitude": form.data["latitude"],
                    "longitude": form.data["longitude"],
                }
            },
            "category": [
                "urbanTreeSpot"
            ],
            "dateLastWatering": "2017-03-31T08:00",
            "dateModified": "2017-03-31T08:00",
            "id": "urn:ngsi-ld:FlowerBed:FlowerBed-1",
            "box_id": form.data["box_id"],
            "nextWateringDeadline": "2017-04-31T08:00",
            "watering_amount_recomendation": 3,
            "watering_date_time_recomendation": "2017-04-31T08:00",
            "box_tensiometer": 20,
            "box_humidity": 0.85,
            "box_temperature": 20,
            "box_soil_type": form.data["soil_type"],
            "box_flower_type": form.data["flowers_type"],
            "box_sun_exposure": form.data["sun_exposure"],
            "box_wind_exposure": "wind",
            "dateInstallation": "2017-03-31T08:00",
            "box_size": form.data["size"],
            "type": "FlowerBed"
        }
        watering_box.save()

        # return data
        return watering_box.data

