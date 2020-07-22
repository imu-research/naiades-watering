from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse

from watering.forms import BoxSetupForm
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
            # TODO migrate to using API
            WateringBox.post(form)

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
        "boxes": WateringBox.list()
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

    # render
    return render(request, 'watering/details.html', {
        'id': id,
        'box': WateringBox.get(box_id)
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
