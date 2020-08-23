from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse

from watering.forms import BoxSetupForm, BoxForm
from watering.models import WateringBox


def home(request):
    # get mode (map or list, defautls to map)
    mode = request.GET.get("mode", "map")

    # get boxes for this user
    boxes = WateringBox.list()

    if boxes:
        return redirect(reverse('box-list'))

    # render
    return render(request, 'watering/index.html', {
        'boxes': boxes,
        'mode': mode,
    })


def box_create(request):
    if request.method == "POST":
        form = BoxSetupForm(request.POST)

        # check if valid & create box
        if form.is_valid():
            # post to API
            WateringBox.post(box_id=None, form=form)

            # get boxes for this user
            boxes = WateringBox.list()

            return render(request, 'watering/map.html', {
                'boxes': boxes,
                'mode': "map",
            })

    else:
        form = BoxSetupForm()

    return render(request, 'watering/create.html', {
        'form': form,
    })


def box_api_list(request):
    return JsonResponse({
        "boxes": [box.data for box in WateringBox.list()]
    })


def list_view(request):
    # get mode (map or list, defautls to map)
    mode = request.GET.get("mode", "map")

    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/list.html', {
        'boxes': boxes,
        'mode': mode,
    })


def box_details(request):
    # get box id
    box_id = request.GET.get("id")

    # find box
    box = WateringBox.get(box_id)

    if request.method == "POST":
        form = BoxForm(request.POST)

        # check if valid & create box
        if form.is_valid():
            # update box
            WateringBox.post(
                box_id=box.data["id"],
                data=form.as_box()
            )

    else:
        form = BoxForm.from_box(box=box)

    # render
    return render(request, 'watering/details.html', {
        'id': box_id,
        'box': box,
        'form': form,
    })


def map_view(request):
    # get mode (map or list, defautls to map)
    mode = request.GET.get("mode", "map")

    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/map.html', {
        'boxes': boxes,
        'mode': mode,
    })


def report(request):
    # get mode (map or list, defautls to map)
    # box_id = request.GET.get("id")

    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/report.html', {
    })


def view_route(request):

    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/route.html', {
        'boxes': boxes,
    })

def box_edit(request):
    # get box id
    box_id = request.GET.get("id")

    # find box
    box = WateringBox.get(box_id)

    if request.method == "POST":
        form = BoxForm(request.POST)

        # check if valid & create box
        if form.is_valid():
            # update box
            WateringBox.post(
                box_id=box.data["id"],
                data=form.as_box()
            )

    else:
        form = BoxForm.from_box(box=box)

    # render
    return render(request, 'watering/edit.html', {
        'id': box_id,
        'box': box,
        'form': form,
    })