$(function() {
    const maxLocalRadius = 0.03; // 30 meters

    const notificationUI = {
        $container: $('#geofencing-notification-container'),

        clear() {
            this.$container.empty();
        },

        notify(localMeasurements) {
            // clear old notifications
            this.clear();

            // get container
            const $container  = this.$container;

            // show notification for each box
            $.each(localMeasurements, function(idx, measurement) {
                const onHideNotification = function() {
                    $notification.remove();
                    //location.href="/"
                };

                const onYESNotification = function () {
                    const that = this;
                    $.ajax({
                        url: `/watering/watered?id=${measurement.boxId}`,
                        success: function (response) {

                        }
                    });
                    $notification.remove();


                };

                const $notification = $('<div />')
                    .addClass('notification')
                    .append($('<div />')
                        .addClass('message')
                        .text(`Are you watering box #${measurement.boxId}?`)
                    )
                    .append($('<button />')
                        .addClass('btn btn-success')
                        .text('Yes')
                        .on('click', onYESNotification)
                    )
                    .append($('<button />')
                        .addClass('btn btn-danger')
                        .text('No')
                        .on('click', onHideNotification)
                    );

                $container.append($notification);
            });
        }
    };

    const onLocationUpdate = function(locationInfo) {
        console.log(locationInfo);

        if (!locationInfo) {
            // empty notifications
            notificationUI.notify([]);

            return
        }

        // show current position
        if (window.NaiadesRouter) {
            window.NaiadesRouter.setCurrentPositionMarker(locationInfo.position);
        }

        // find measurements around
        const localMeasurements = NaiadesWateringData.measurements.filter(
            measurement => LocationManager.getDistance(
                measurement.location.position, locationInfo.position
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

        // subscribe to location manager
        LocationManager.subscribe(onLocationUpdate);

        // clear interval
        clearInterval(waitMeasurements);
    }, 500);
});
