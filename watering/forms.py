from django.forms import Form, ModelForm
from django.forms.fields import CharField, DateField, ChoiceField, DecimalField

from django.utils.translation import gettext as _

from watering.models import Issue
from .lists import *


class BoxForm(Form):
    soil_type = ChoiceField(required=True, label=_('Type of soil'), choices=SOIL_TYPES)
    flowers_type = ChoiceField(required=True, label=_('Type of flowers'), choices=FLOWER_TYPES)
    sun_exposure = ChoiceField(required=True, label=_('Exposure to sun'), choices=SUN_EXPOSURE_OPTIONS)
    installed_at = CharField(required=True, label=_('Installation date'))
    size = CharField(required=True, label=_('Box size'))

    @staticmethod
    def from_box(box):
        data = box.data

        return BoxForm({
            "soil_type": data["soilType"],
            "flowers_type": data["flowerType"],
            "sun_exposure": data["sunExposure"],
            "installed_at": data["installationDate"],
            "size": data["boxSize"],
        })

    def as_box(self):
        return {
            "soilType": self.data["soil_type"],
            "flowerType": self.data["flowers_type"],
            "sunExposure": self.data["sun_exposure"],
            "installationDate": self.data["installed_at"],
            "boxSize": self.data["size"],
        }


class BoxSetupForm(BoxForm):
    box_id = CharField(required=True, label=_('Box ID'))

    # location information
    address = CharField(required=True)
    latitude = DecimalField()
    longitude = DecimalField()


class IssueForm(ModelForm):
    class Meta:
        model = Issue
        fields = ("issue_type", "description", )
