import ast

from django.core.exceptions import ValidationError
from django.forms import Form, ModelForm
from django.forms.widgets import Select
from django.forms.fields import CharField, DateField, ChoiceField, IntegerField

from django.utils.translation import gettext as _

from watering.models import Issue
from .lists import *


class BoxForm(Form):
    soil_type = ChoiceField(required=True, label=_('Type of soil'), choices=SOIL_TYPES)
    flowers_type = ChoiceField(required=True, label=_('Type of flowers'), choices=FLOWER_TYPES)
    sun_exposure = ChoiceField(required=True, label=_('Exposure to sun'), choices=SUN_EXPOSURE_OPTIONS)
    number_of_boxes = IntegerField(required=True, label=_('Number of boxes'))

    @staticmethod
    def from_box(box):
        data = box.data

        return BoxForm({
            "flowers_type": data.get("flowerType"),
            "sun_exposure": data.get("sunExposure"),
            "refDevice": data.get("refDevice"),
            "soil_type": data.get("soil_type"),
            "number_of_boxes": data.get("number_of_boxes"),
        })

    def as_box(self):
        return {
            "flowerType": self.data["flowers_type"],
            "sunExposure": self.data["sun_exposure"],
            "refDevice": self.data["refDevice"] if self.data["refDevice"] != "none" else None,
            "category": [
                self.data["soil_type"],
                "numberOfInstances: %d" % int(self.data["number_of_boxes"])
            ],
        }


class BoxSetupForm(BoxForm):
    box_id = CharField(required=True, label=_('Box ID'))

    # Sensor ID
    refDevice = CharField(required=True, label=_('Sensor ID'), widget=Select)

    # Array of points (Cluster Polygon coordinates)
    location = CharField(required=True)

    def clean_location(self):
        location = self.data.get('location')

        try:
            return [
                "%s,%s" % (str(position[1]), str(position[0]))
                for position in ast.literal_eval(location)
            ]
        except (SyntaxError, IndexError):
            raise ValidationError("Invalid flowerbed location - please check formatting.")

    def as_box(self):
        data = super().as_box()

        data.update({
            "id": f"urn:ngsi-ld:FlowerBed:FlowerBed-{self.data['box_id']}",
            "type": "FlowerBed",
            "flowerType": self.data.get('flowers_type'),
            "location": self.cleaned_data["location"],
            "dateLastWatering": "1970-01-01T01:00:00.00Z",
            "nextWateringDeadline": "1970-01-01T01:00:00.00Z",
            "soilMoisture": 0,
            "sunExposure": self.data.get('sun_exposure'),
            "refDevice": self.data.get('refDevice'),
            "category": [
                self.data["soil_type"],
                "numberOfInstances: %d" % int(self.data["number_of_boxes"])
            ],
        })

        return data


class IssueForm(ModelForm):
    class Meta:
        model = Issue
        fields = ("issue_type", "description", )
