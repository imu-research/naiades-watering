function initMap() {

  this.map = L.map('mapid').setView([46.1838136, 6.138625], 15);

            L.tileLayer(
                'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: 'pk.eyJ1IjoiZXZhbmdlbGllOTAiLCJhIjoiY2thanU1YzFrMGU5MDJ6anVtY3FpdDQwaiJ9.G5trmcJe4LgebhQxVzgVMw'
                }
            ).addTo(this.map);

    loadData();


}

function displayRoute(waypoints) {
    //const waypoints = loadData();
    console.log(waypoints)
    var pointA = new google.maps.LatLng(46.1844399,6.1403968),
    pointB = new google.maps.LatLng(46.1844509,6.1404972),
    //w1 = new google.maps.LatLng(46.1842538, 6.1378354),
    //w2 = new google.maps.LatLng(46.184193, 6.13911),
    //waypointsArray = [{location:w1, stopover:true}, {location:w2, stopover:true}],
    waypointsArray = waypoints,
    myOptions = {
      zoom: 7,
      center: pointA
    },
    map = new google.maps.Map(document.getElementById('mapid'), myOptions),
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService,
    directionsDisplay = new google.maps.DirectionsRenderer({
      map: map
    });
    /*markerA = new google.maps.Marker({
      position: pointA,
      title: "point A",
      label: "A",
      map: map
    }),
    markerB = new google.maps.Marker({
      position: pointB,
      title: "point B",
      label: "B",
      map: map
    });*/


  // get route from A to B
  calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB,waypointsArray);


}



function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB,waypointsArray) {
  directionsService.route({
    origin: pointA,
    destination: pointB,
    waypoints: waypointsArray,
      optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function loadData() {
    const that = this;
    $.ajax({
        url: '/watering/api/boxes/list',
        success: function (response) {
            const boxes = response.boxes;
            const today = new Date();

            $.each(boxes, function (idx, box) {
                // check if setup
                //box.isSetup = that.isSetup(box);

                // set next watering
                //box.nextWatering = 'UNKNOWN';
                if (!box.nextWateringDeadline) {
                    return
                }

                const parts = box.nextWateringDeadline.split('T')[0].split('-');

                // get watering
                const nextWateringDate = new Date(
                    Number.parseInt(parts[0]),
                    Number.parseInt(parts[1]) - 1,
                    Number.parseInt(parts[2])
                );

                // same date?
                if ((nextWateringDate.getFullYear() === today.getFullYear()) &&
                    (nextWateringDate.getMonth() === today.getMonth()) &&
                    (nextWateringDate.getDate() === today.getDate())) {
                    box.nextWatering = 'TODAY';
                }

                // next date?
                // TODO improve check - this fails for the last day of the month
                else if ((nextWateringDate.getFullYear() === today.getFullYear()) &&
                    (nextWateringDate.getMonth() === today.getMonth()) &&
                    (nextWateringDate.getDate() - 1 === today.getDate())) {
                    box.nextWatering = 'TOMORROW';
                }

                // in the past?
                else if (nextWateringDate < today) {
                    box.nextWatering = 'UNKNOWN';
                } else {
                    // just future
                    box.nextWatering = 'FUTURE';
                }

            });

            that.fetchedMeasurements = boxes;
            that.measurements = boxes;

            // filter & show
            const waypoints = showFilteredMeasurements(that.measurements);
            console.log(waypoints)
            //return waypoints;
            //that.showFilteredMeasurements();
            displayRoute(waypoints);
        }
    })
}

function showFilteredMeasurements(m) {

            // get selection
            const nextWatering = $('#next-watering').val();

            // clear all
            //clear(m);

            // filter
            const measurements = m
                .filter(box => nextWatering === "" || box.nextWatering === nextWatering);

            // show points
            //window.NaiadesRender.render(measurements)
            console.log(measurements)
            const waypoints = render(measurements);
            console.log(waypoints)
            return waypoints;
        }

function render(measurements) {
            const map = this.map;

            // get max consumption
            //const maxConsumption = this.getMaxConsumption();

            const that = this;
            const waypointsArray = [];
            $.each(measurements, function(idx, measurement) {
                const point = new google.maps.LatLng(measurement.location.coordinates[1], measurement.location.coordinates[0]);
                console.log(measurement.location.coordinates[1]);

                waypointsArray.push({location:point, stopover:true});


            });
            return waypointsArray;
        }
function clear(items) {
    $.each(items, function (idx, item) {
        item.remove();
    });
}
// attach reload on watering type change
    $('#next-watering').on('change', function() {
        loadData();
    })
initMap();