$(function() {
    const maxLocalRadius = 0.02; // 20 meters

    const setRoutePositionMarker = function(controller, position) {
        let mapsPosition;
        try {
            mapsPosition = new google.maps.LatLng(position.lat, position.lng);
        } catch(err) {
            return
        }

        if (!controller.currentPositionMarker) {
            controller.currentPositionMarker = new google.maps.Marker({
                icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
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

        redirectTo(measurement) {
            // construct cluster's URL
            const clusterUrl = `/watering/cluster/?id=${measurement.boxId}`;

            // no need to actually redirect if we're already in cluster
            if (window.location.href.includes(clusterUrl)) {
                return
            }

            // perform redirect
            window.location.href = `${clusterUrl}&return=event-log`;
        },

        notify(localMeasurements) {
            // clear old notifications
            this.clear();

            // get container
            const $container  = this.$container;

            // no options
            if (localMeasurements.length === 0) {

                // check if we were automatically redirected
                const shouldReturn = (new URLSearchParams(window.location.search)).get("return");

                // redirect to original page
                if (shouldReturn) {
                    window.location.href = `/watering/?from=${window.BOX_ID}`;
                }

                return
            }

            // redirect if only one is present & functionality is not disabled
            if ((localMeasurements.length === 1) && (!window.SETTINGS.disableAutomaticClusterRedirect)) {
                return this.redirectTo(localMeasurements[0]);
            }

            // show notifications for different points
            this.showNotifications($container, localMeasurements);
        },

        showNotifications($container, localMeasurements) {
            // show dialog to select from many
            const $notification = $('<div />')
                .addClass('notification')
                .append($('<div />')
                    .addClass('message')
                    .text(window.MESSAGES.selectBoxAboutToStartWatering)
                );

            // show an option for each local measurement
            $.each(localMeasurements, function (idx, localMeasurement) {
                $notification
                    .append($('<button />')
                        .addClass('btn btn-success')
                        .css("margin-right", "10px")
                        .text(localMeasurement.name || `Box #${localMeasurement.id}`)
                        .on('click', function () {
                            notificationUI.redirectTo(localMeasurement);
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
        if (!locationInfo) {
            // empty notifications
            return notificationUI.notify([]);
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
                lat: ((measurement.sensor || {}).location || [0,0])[0],
                lng: ((measurement.sensor || {}).location || [0,0])[1]
            }, locationInfo.position
            ) < maxLocalRadius
        );

        // show notifications
        notificationUI.notify(localMeasurements);
    };

    // get measurements
    const waitMeasurements = setInterval(function() {
        // check if still null
        if (NaiadesWateringData.measurements === null) {
            return
        }

        // trigger UI update on initial location
        if (LocationManager.locationInfo && LocationManager.locationInfo.position) {
            onLocationUpdate(LocationManager.locationInfo);
        }

        // subscribe to location manager
        LocationManager.subscribe(onLocationUpdate);

        // clear interval
        clearInterval(waitMeasurements);
    }, 500);
});
