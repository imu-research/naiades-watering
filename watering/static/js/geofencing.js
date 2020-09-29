$(function() {
    const onLocationUpdate = function(locationInfo) {
        console.log(locationInfo);
    };

    // get measurements
    const waitMeasurements = setInterval(function() {
        // check if still null
        if (NaiadesWateringData.filteredMeasurements === null) {
            return
        }

        // subscribe to location manager
        LocationManager.subscribe(onLocationUpdate);

        // clear interval
        clearInterval(waitMeasurements);
    }, 500);
});
