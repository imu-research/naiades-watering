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

        displayRoute: function(startPosition, waypoints) {
            var pointA = new google.maps.LatLng(46.1844399,6.1403968),
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

            const startLatLng = new google.maps.LatLng(startPosition.lat, startPosition.lng);

            //Find destination the farthest box from posit
            const destination = this.findDestination(startLatLng, waypointsArray);

            //Remove destination from waypoints
            if (!destination) {
                return
            }

            // get route from current position to destination
            this.calculateAndDisplayRoute(
                directionsService, directionsDisplay, startLatLng, destination.final, destination.waypoints
            );
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

            this.displayRoute(LocationManager.devLocations[0], waypoints);
        }
    };
});