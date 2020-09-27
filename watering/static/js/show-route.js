$(function() {
    window.NaiadesRouter = {
        findDestination: function(origin, waypoints) {
            // no route
            if (waypoints.length === 0 ){
                return null;
            }

            let maxDistance = -1;
            let maxDistanceIdx = -1;
            const that = this;
            $.each(waypoints, function(idx, waypoint) {
                const distance = that.distance(waypoint.location, origin);

                if (distance > maxDistance) {
                    maxDistance = distance;
                    maxDistanceIdx = idx;
                }
            });

            return {
                final: waypoints[maxDistanceIdx].location,
                waypoints: waypoints.slice(0, maxDistanceIdx).concat(
                    waypoints.slice(maxDistanceIdx + 1)
                )
            };
        },

        distance: function(position1,position2){
            var lat1=position1.lat();
            var lat2=position2.lat();
            var lon1=position1.lng();
            var lon2=position2.lng();
            var R = 6371; // Radius of the earth in km
            var dLat = this.toRadians(lat2-lat1);  // deg2rad below
            var dLon = this.toRadians(lon2-lon1);
            var a = (
                Math.sin(dLat/2) *
                Math.sin(dLat/2)
            ) + (
                Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon/2) *
                Math.sin(dLon/2)
            );
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d;
        },

        toRadians: function(Value) {
            /** Converts numeric degrees to radians */
            return Value * Math.PI / 180;
        },

        calculateAndDisplayRoute: function(directionsService, directionsDisplay, pointA, pointB,waypointsArray) {
            directionsService.route({
                origin: pointA,
                destination: pointB,
                waypoints: waypointsArray,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING
            }, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        },

        displayRoute: function(waypoints) {
            //const waypoints = loadData();
            const that = this;

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
            map = new google.maps.Map(document.getElementById(NaiadesRender.containerId), myOptions),
            // Instantiate a directions service.
            directionsService = new google.maps.DirectionsService,
            directionsDisplay = new google.maps.DirectionsRenderer({
              map: map
            });


          // get route from current position to point B
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                  function (position) {
                      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                      //Find destination the farthest box from current position
                      var destination = that.findDestination(pos,waypointsArray);

                      if (!destination) {
                          return
                      }
                      // get route from current position to destination
                      that.calculateAndDisplayRoute(directionsService, directionsDisplay, pos, destination.final, destination.waypoints);
                  }
              );
          }
          else {
              var posit = new google.maps.LatLng(46.1844399,6.1403968);
              //Find destination the farthest box from posit
              var destination = this.findDestination(posit,waypointsArray);
              //Remove destination from waypoints
              if (!destination) {
                  return
              }
              // get route from current position to destination
              this.calculateAndDisplayRoute(directionsService, directionsDisplay, posit, destination.final, destination.waypoints);
            }
        },

        renderRoute: function(meters) {
            const waypoints = [];
            $.each(meters, function(idx, meter) {
                const point = new google.maps.LatLng(meter.location.coordinates[1], meter.location.coordinates[0]);

                waypoints.push({
                    location:point,
                    stopover:true
                });
            });

            this.displayRoute(waypoints);
        }
    };
});