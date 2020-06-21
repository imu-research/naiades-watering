from django.forms import Form
from django.forms.fields import CharField, DateField, ChoiceField

from django.utils.translation import gettext as _

from .lists import *


class BoxSetupForm(Form):
    box_id = CharField(required=True, label=_('Box ID'))
    soil_type = ChoiceField(required=True, label=_('Type of soil'), choices=SOIL_TYPES)
    flowers_type = ChoiceField(required=True, label=_('Type of flowers'), choices=FLOWER_TYPES)
    sun_exposure = ChoiceField(required=True, label=_('Exposure to sun'), choices=SUN_EXPOSURE_OPTIONS)
    installed_at = DateField(required=True, label=_('Installation date'))
    size = CharField(required=True, label=_('Box size'))
