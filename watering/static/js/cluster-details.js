$(function() {
    const WateringProgressView = {
        $bar: null,
        $element: null,
        consumption: null,
        listener: null,

        totalRecommendedConsumption: (
            window.RECOMMENDED_CONSUMPTION * window.NUMBER_OF_BOXES
        ),
        REFRESH_INTERVAL: 5000,  // in milliseconds

        initialize: function($container) {
            // initialize gauge
            window.ClusterDetailsGauge.initialize(window.RECOMMENDED_CONSUMPTION);

            return this;
        },

        setConsumption: function(consumption) {
            // check if changed
            if (this.consumption === consumption) {
                return
            }

            // set consumption
            this.consumption = consumption;

            // set gauge value
            window.ClusterDetailsGauge.setValue(this.consumption);

            return this
        },

        update: function() {
            $.ajax({
                "url": `${window.location.href}&events=true`,
                success: function({events}) {
                    // calculate total consumption
                    const consumption = events
                        .map(event => Number(event.consumption))
                        .reduce((a, b) => a + b);

                    // update
                    WateringProgressView.setConsumption(consumption);
                }
            });
        },

        listen: function() {
            // check if already listening
            if (this.listener) {
                return this;
            }

            // update
            this.update();

            // start listener
            this.listener = window.setInterval(function() {
                WateringProgressView.update();
            }, this.REFRESH_INTERVAL);

            return this;
        },

        stopListening: function() {
            // clear & stop listener
            if (this.listener) {
                window.clearInterval(this.listener);
                this.listener = null;
            }

            return this;
        }
    };

    // initialize & listen
    WateringProgressView
        .initialize()
        .listen();
});
