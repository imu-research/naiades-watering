from django.utils.translation import gettext as _


SOIL_TYPES = (
    ("soilNormal", _("Normal")),
    ("soilCompost", _("Compost")),
)


FLOWER_TYPES = (
    ("Annual", _("Annual")),
    ("Perennial", _("Perennial")),
)


SUN_EXPOSURE_OPTIONS = (
    ("Sunny", _("Sunny")),
    ("Mid shadow", _("Mid shadow")),
    ("None", _("None")),
)

'''BOX_SIZES = (
    ("Small", _("Small")),
    ("Large", _("Large")),
)'''

DEVICE_STATUSES = (
    ("active", _("Active")),
    ("maintenance", _("Maintenance")),
    ("disabled", _("Disabled")),
)
