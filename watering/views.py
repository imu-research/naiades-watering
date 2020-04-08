from django.shortcuts import render


def home(request):
    return render(request, 'watering/index.html')
