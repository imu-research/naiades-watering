import ast

from django.core.exceptions import ValidationError
from django.forms import Form, ModelForm
from django.forms.widgets import Select
from django.forms.fields import CharField, DateField, ChoiceField, DecimalField

from django.utils.translation import gettext as _

from watering.models import Issue
from .lists import *


class BoxForm(Form):
    #soil_type = ChoiceField(required=True, label=_('Type of soil'), choices=SOIL_TYPES)
    flowers_type = ChoiceField(required=True, label=_('Type of flowers'), choices=FLOWER_TYPES)
    sun_exposure = ChoiceField(required=True, label=_('Exposure to sun'), choices=SUN_EXPOSURE_OPTIONS)
    #installed_at = CharField(required=True, label=_('Installation date'))
    #size = ChoiceField(required=True, label=_('Box size'), choices=BOX_SIZES)

    @staticmethod
    def from_box(box):
        data = box.data

        return BoxForm({
            #"soil_type": data["soilType"],
            "flowers_type": data["flowerType"],
            "sun_exposure": data["sunExposure"],
            #"installed_at": data["installationDate"],
            #"size": data["boxSize"],
            "refDevice": data["refDevice"],

        })

    def as_box(self):
        return {
            #"soilType": self.data["soil_type"],
            "flowerType": self.data["flowers_type"],
            "sunExposure": self.data["sun_exposure"],
            #"installationDate": self.data["installed_at"],
            #"boxSize": self.data["size"],
            "refDevice": self.data["refDevice"] if self.data["refDevice"] != "none" else None,
        }


class BoxSetupForm(BoxForm):
    box_id = CharField(required=True, label=_('Box ID'))

    # Sensor ID
    refDevice = CharField(required=True, label=_('Sensor ID'), widget=Select)

    # Array of points (Cluster Polygon coordinates)
    location = CharField(required=True)

    # location information
    # TODO remove - migrated to Sensor model
    # address = CharField(required=True)
    # latitude = DecimalField()
    # longitude = DecimalField()

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
            "refDevice": self.data.get('refDevice')
        })

        return data


class IssueForm(ModelForm):
    class Meta:
        model = Issue
        fields = ("issue_type", "description", )
