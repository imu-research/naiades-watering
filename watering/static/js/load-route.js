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

  var pointA = new google.maps.LatLng(46.1844399,6.1403968),
    pointB = new google.maps.LatLng(46.1844509,6.1404972),
    w1 = new google.maps.LatLng(46.1842538, 6.1378354),
    w2 = new google.maps.LatLng(46.184193, 6.13911),
    waypointsArray = [{location:w1, stopover:true}, {location:w2, stopover:true}],
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

initMap();