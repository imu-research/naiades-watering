from watering.forms import BoxForm, GardenerBoxForm
from watering.models import WateringBox
from watering.templatetags.app_filters import is_gardener


def base_box_edit(request, box):
    if request.method != "POST":
        return BoxForm.from_box(box=box)

    # different form between gardeners & other users
    gardener = is_gardener(request.user)
    form = (
        GardenerBoxForm if gardener else BoxForm
    )(request.POST)

    # check if valid & create box
    if not form.is_valid():
        return form

    data = form.as_box()

    if "refDevice" not in data:
        data.update({
            "refDevice": box.data["refDevice"],
        })

    # update box
    WateringBox.post(
        box_id=box.data["id"],
        data=data,
        only_status=not gardener,
    )

    # for gardeners, return form with full data
    if gardener:
        form = BoxForm.from_box(box, updated={
            "device_status": request.POST["device_status"],
        })

    return form
