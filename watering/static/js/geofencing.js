$(function() {
    const maxLocalRadius = 0.03; // 30 meters

    const setRoutePositionMarker = function(controller, position) {
        const mapsPosition = new google.maps.LatLng(position.lat, position.lng);

        if (!controller.currentPositionMarker) {
            controller.currentPositionMarker = new google.maps.Marker({
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                position: mapsPosition,
                title: window.MESSAGES.currentLocation,
                map: controller.map,
            });
        } else {
            controller.currentPositionMarker.setPosition(mapsPosition);
        }
    };

    const setRenderPositionMarker = function(controller, position) {
        const color = '#4fc1e9';

        // remove previous marker
        if (controller.currentPositionMarker) {
            controller.currentPositionMarker.remove();
        }

        // add marker based on current location
        controller.currentPositionMarker = L.marker([position.lat, position.lng], {
            icon: controller.getIcon(color),
            color: '#555',
            fillColor: color,
            fillOpacity: 0.8,
            radius: 30,
            title: "Your current location"
        }).addTo(controller.map)
    };

    const notificationUI = {
        $container: $('#geofencing-notification-container'),

        clear() {
            this.$container.empty();
        },

        notify(localMeasurements, automaticRedirect) {
            // clear old notifications
            this.clear();

            // get container
            const $container  = this.$container;

            const redirectTo = function(measurement) {
                window.location.href = `/watering/cluster/?id=${measurement.boxId}`
            };

            // no options - nothing to do
            if (localMeasurements.length === 0) {
                return
            }

            // automatically redirect if only one is present
            if ((localMeasurements.length === 1) && automaticRedirect) {
                return redirectTo(localMeasurements[0]);
            }

            // show dialog to select from many
            const $notification = $('<div />')
                .addClass('notification')
                .append($('<div />')
                    .addClass('message')
                    .text("Please select the box you're about to start watering.")
                );

            // show an option for each local measurement
            $.each(localMeasurements, function (idx, localMeasurement) {
                $notification
                    .append($('<button />')
                        .addClass('btn btn-success')
                        .css("margin-right", "10px")
                        .text(`Box ${localMeasurement.boxId}`)
                        .on('click', function () {
                            redirectTo(localMeasurement);
                        })
                    );
            });

            // add skip option
            $notification
                .append($('<button />')
                    .addClass('btn btn-error pull-right')
                    .text(`Close`)
                    .on('click', function () {
                        $notification.remove();
                    })
                );

            $container.append($notification);
        }
    };

    const onLocationUpdate = function(locationInfo) {
        console.log(locationInfo);

        if (!locationInfo) {
            // empty notifications
            return notificationUI.notify([], false);
        }

        // show current position in router & render maps
        if (window.NaiadesRouter) {
            setRoutePositionMarker(window.NaiadesRouter, locationInfo.position);
        }

        if (window.NaiadesRender) {
            setRenderPositionMarker(window.NaiadesRender, locationInfo.position);
        }

        // find measurements around
        const localMeasurements = NaiadesWateringData.measurements.filter(
            measurement => LocationManager.getDistance(
                {
                lat: measurement.sensor.location[0],
                lng: measurement.sensor.location[1],
            }, locationInfo.position
            ) < maxLocalRadius
        );

        // show notifications
        notificationUI.notify(localMeasurements, locationInfo.mode !== "dev");
    };

    // get measurements
    const waitMeasurements = setInterval(function() {
        // check if still null
        if (NaiadesWateringData.measurements === null) {
            return
        }

        // subscribe to location manager
        LocationManager.subscribe(onLocationUpdate);

        // clear interval
        clearInterval(waitMeasurements);
    }, 500);
});
