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
            #Create FlowerBed post API
            # get boxes for this user
            boxes = []

            return render(request, 'watering/map.html', {
                'boxes': boxes,
                'mode': "map",
            })


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

def box_details(request):
    # get box id
    id = request.GET.get("id")

    # render
    return render(request, 'watering/details.html', {
        'id': id,
    })

def map_view(request):
    # get mode (map or list, defautls to map)
    mode = request.GET.get("mode", "map")

    # get boxes for this user
    boxes = []

    # render
    return render(request, 'watering/map.html', {
        'boxes': boxes,
        'mode': mode,
    })