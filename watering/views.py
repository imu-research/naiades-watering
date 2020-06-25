from django.shortcuts import render

from watering.forms import BoxSetupForm


def home(request):
    # get mode (map or list, defautls to map)
    mode = request.GET.get("mode", "map")

    # get boxes for this user
    boxes = []

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
            pass
    else:
        form = BoxSetupForm()

    return render(request, 'watering/create.html', {
        'form': form,
    })

def list_view(request):
    # get mode (map or list, defautls to map)
    mode = request.GET.get("mode", "map")

    # get boxes for this user
    boxes = []

    # render
    return render(request, 'watering/list.html', {
        'boxes': boxes,
        'mode': mode,
    })