$(function() {
    window.LocationManager = {
        locationInfo: null,
        status: "idle",
        mode: "normal",
        devLocations: [{lat: 46.18260566855992, lng: 6.149442672467558}, {lat: 46.184121008876915, lng: 6.145751952863067}, {lat: 46.186676194027335, lng: 6.14240455601248}, {lat: 46.18774577115181, lng: 6.140516280865997}, {lat: 46.1854773515832, lng: 6.139036774602574}, {lat: 46.18460234351811, lng: 6.140342473918282}, {lat: 46.18420123159916, lng: 6.140213727885567}, {lat: 46.18405267088648, lng: 6.141050577098214}, {lat: 46.18303501921093, lng: 6.141372442180001}, {lat: 46.18167415920967, lng: 6.14089286324088}, {lat: 46.181238855192824, lng: 6.138284682965605}, {lat: 46.18367532488418, lng: 6.1375122067693155}, {lat: 46.182575955587176, lng: 6.133521079755155}, {lat: 46.18058514983161, lng: 6.130688667035429}, {lat: 46.17776224198149, lng: 6.129100799298612}, {lat: 46.174909472087414, lng: 6.130688667035429}, {lat: 46.17823768924205, lng: 6.135752677655546}, {lat: 46.180198865737616, lng: 6.144035339093534}],
        devLocationsIdx: null,
        interval: 1000,
        intervalRef: null,
        positionUpdateCallbacks: {},

        requestLocationInfo: function() {
            if (this.mode === "dev") {
                this.updateLocationInfo(this.devLocations[this.devLocationsIdx]);
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position){
                        window.LocationManager.updateLocationInfo({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    });
                }
            }
        },

        updateLocationInfo: function(position) {
            // create location info object
            const locationInfo = {
                mode: this.mode,
                position: position
            };

            // check if position changed
            if (!(
                ((locationInfo.position || {}).lat !== ((this.locationInfo || {}).position || {}).lat) ||
                ((locationInfo.position || {}).lng !== ((this.locationInfo || {}).position || {}).lng)
            )) {
                return
            }

            // update location info object
            this.locationInfo = locationInfo;

            // trigger callbacks
            const positionUpdateCallbacks = this.positionUpdateCallbacks;
            $.each(Object.entries(positionUpdateCallbacks), function(idx, info) {
                try {
                    // trigger callback with new location
                    positionUpdateCallbacks[info[0]](locationInfo);
                } catch {
                    // ignore callback failures
                }
            });
        },

        start: function() {
            // start dev
            if (this.mode === "dev") {
                this.devLocationsIdx = 0;
            }

            // listen for location changes
            this.intervalRef = setInterval(function() {
                LocationManager.requestLocationInfo()
            }, this.interval);
        },

        stop: function() {
            // clear listener
            if (this.intervalRef) {
                clearInterval(this.intervalRef);
                this.intervalRef = null;
            }

            // stop dev
            if (this.mode === "dev") {
                this.devLocationsIdx = null;
            }
        },

        subscribe: function(callback) {
            // get a subscriber ID
            const subscriberId = Math.floor(Math.random() * Math.pow(10, 9));

            // add callback
            this.positionUpdateCallbacks[subscriberId] = callback;

            // return ID
            return subscriberId;
        },

        unsubscribe: function(subscriberId) {
            // remove callback
            delete this.positionUpdateCallbacks[subscriberId];
        },

        setModeAndRestart: function(mode) {
            // stop listening
            this.stop();

            // change mode
            this.mode = "normal";  // mode;

            // start
            this.start();
        },

        moveToNextDevLocation: function() {
            if (this.mode !== "dev") {
                return
            }

            // move to next location
            this.devLocationsIdx = (this.devLocationsIdx + 1) % this.devLocations.length;
        },

        getDistance: function(position1, position2){
            const lat1 = position1.lat;
            const lat2 = position2.lat;
            const lon1 = position1.lng;
            const lon2 = position2.lng;

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
    };
});