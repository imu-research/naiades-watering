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
                const distance = that.getDistance(waypoint.location, origin);

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

        getDistance: function(position1, position2) {
            return LocationManager.getDistance({
                lat: position1.lat(),
                lng: position1.lng()
            }, {
                lat: position2.lat(),
                lng: position2.lng()
            })
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

            const pointA = new google.maps.LatLng(46.1844399,6.1403968);
            const waypointsArray = waypoints;
            const myOptions = {
                zoom: 7,
                center: pointA
            };

            this.map = new google.maps.Map(document.getElementById(NaiadesRender.containerId), myOptions);

            // Instantiate a directions service.
            const directionsService = new google.maps.DirectionsService;
            const directionsDisplay = new google.maps.DirectionsRenderer({
                map: this.map
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

        setCurrentPositionMarker(position) {
            const mapsPosition = new google.maps.LatLng(position.lat, position.lng);

            if (!this.currentPositionMarker) {
                this.currentPositionMarker = new google.maps.Marker({
                    position: mapsPosition,
                    title: 'Your current location',
                    map: this.map,
                });
            } else {
                this.currentPositionMarker.setPosition(mapsPosition);
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

            this.displayRoute(LocationManager.devLocations[0], waypoints);
        }
    };
});