import datetime

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils.timezone import now

from naiades_watering.settings import DEBUG
from watering.forms import BoxSetupForm, BoxForm, IssueForm
from watering.models import WateringBox, Issue


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
            WateringBox.post(box_id=None, data=form.data)

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


def box_details(request):
    # get box id
    box_id = request.GET.get("id")

    # find box
    box = WateringBox.get(box_id)

    # get humidity historic data
    history = box_history(box_id)

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
        'history': history,
    })


def list_issues(request, box_id):
    # get issues
    # sort newest first
    issues = Issue.objects.filter(box_id=box_id).order_by('-created')

    # show issue list
    return render(request, 'watering/issues/index.html', {
        "box_id": box_id,
        "issues": issues,
    })


def report_issue(request, box_id):
    if request.method == "POST":
        form = IssueForm(request.POST, instance=None)

        if form.is_valid():
            # create new issue
            issue = form.save(commit=False)

            # fill in context
            issue.box_id = box_id
            issue.submitted_by = request.user

            # save
            issue.save()

            # return to issue list
            return redirect(reverse('list-issues', kwargs={"box_id": box_id}))
    else:
        form = IssueForm()

    return render(request, 'watering/issues/report.html', {
        "box_id": box_id,
        "form": form,
    })


def show_watering_points(request, mode):
    # get boxes for this user
    boxes = WateringBox.list()

    # render
    return render(request, 'watering/view.html', {
        'boxes': boxes,
        'mode': mode,
        'TESTING': DEBUG,
    })


def map_view(request):
    return show_watering_points(request, mode='map')


def list_view(request):
    return show_watering_points(request, mode='list')


def route_view(request):
    return show_watering_points(request, mode='route')
# def view_route(request):
#
#     # get boxes for this user
#     boxes = WateringBox.list()
#
#     # render
#     return render(request, 'watering/route.html', {
#         'boxes': boxes,
#     })


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

def box_history(box_id):
    # find box
    box = WateringBox.get(box_id)

    historic_data = WateringBox.history(
        box_id=box.data["id"]
    )

    # render
    return historic_data