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
            // create progress bar
            this.$bar = $("<div />")
                .addClass("progress-bar")
                .attr("role", "progressbar")
                .css("width", 0);

            // create watering progress view element
            this.$element = $("<div />")
                .addClass("progress-container")
                .append(
                    $("<h5 />")
                        .text("Predicted Required  Water Amount (Cluster):")
                )
                .append(
                    $("<div />")
                        .addClass("watering-value")
                        .append(
                            $("<span />")
                                .addClass("value")
                                .text("0 lt")
                        )
                        .append(
                            $("<span />")
                                .text(`/ ${window.RECOMMENDED_CONSUMPTION} lt`)
                        )
                )
                .append(
                    $("<div />")
                        .addClass("progress progress-striped active")
                        .append(
                            $("<div />")
                                .addClass("progress")
                                .append(this.$bar)
                        )
                );

            // add to container
            $container.append(this.$element);

            return this;
        },

        setConsumption: function(consumption) {
            // check if changed
            if (this.consumption === consumption) {
                return
            }

            // set consumption
            this.consumption = consumption;

            // set bar progress
            this.$bar
                .css("width", `${Math.min(Math.round(consumption * 100 / this.totalRecommendedConsumption), 100)}%`);

            // update consumption text
            this.$element
                .find(".watering-value > span.value")
                .text(`${consumption} lt`);

            return this;
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
        .initialize($("#cluster-details-container"))
        .listen();
});
