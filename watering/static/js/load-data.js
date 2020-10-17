$(function () {
    window.NaiadesWateringData = {

        // state management
        fetchedMeasurements: null,
        measurements: null,

        // filters
        selectedActivityType: '',

        wateringFromDate: function(wateringDate) {
            if (!wateringDate) {
                return 'UNKNOWN'
            }

            // get current date
            const today = new Date();

            // split input date into parts
            const parts = wateringDate.split('T')[0].split('-');

            // parse watering date
            const wDate = new Date(
                Number.parseInt(parts[0]),
                Number.parseInt(parts[1]) - 1,
                Number.parseInt(parts[2])
            );

            // same date?
            if ((wDate.getFullYear() === today.getFullYear()) &&
                (wDate.getMonth() === today.getMonth()) &&
                (wDate.getDate() === today.getDate())) {
                return 'TODAY';
            }

            // next date?
            // TODO improve check - this fails for the last day of the month
            else if ((wDate.getFullYear() === today.getFullYear()) &&
                (wDate.getMonth() === today.getMonth()) &&
                (wDate.getDate() - 1 === today.getDate())) {
                return 'TOMORROW';
            }

            // in the past?
            else if (wDate < today) {
                return 'UNKNOWN';
            }
            else {
                // just future
                return 'FUTURE';
            }
        },

        loadData: function() {
            const that = this;
            $.ajax({
                url: '/watering/api/boxes/list',
                success: function(response) {
                    const boxes = response.boxes;

                    $.each(boxes, function(idx, box) {

                        // set position
                        box.location.position = {
                            lat: box.location.coordinates[1],
                            lng: box.location.coordinates[0]
                        };

                        // check if setup
                        box.isSetup = that.isSetup(box);

                        // set last & next watering
                        box.lastWatering = that.wateringFromDate(box.dateLastWatering);
                        box.nextWatering = that.wateringFromDate(box.nextWateringDeadline);
                    });

                    that.fetchedMeasurements = boxes;
                    that.measurements = boxes;

                    // filter & show
                    that.showFilteredMeasurements();
                }
            });
        },

        showFilteredMeasurements: function() {

            // get selection
            const nextWatering = $('#next-watering').val();

            // clear all
            window.NaiadesRender.clear();

            // filter
            this.filteredMeasurements = this.measurements
                .filter(box => nextWatering === "" || box.nextWatering === nextWatering);

            // show points
            window.NaiadesRender.render(this.filteredMeasurements);
        },

        isSetup: function(meter) {
            return meter.flowerType && meter.sunExposure;
        },

        load: function() {
            // initialize renderer
            window.NaiadesRender.initialize();

            // load data
            this.loadData();
        },

    };

    // run data component
    NaiadesWateringData.load();

    // attach reload on watering type change
    $('#next-watering').on('change', function() {
        NaiadesWateringData.showFilteredMeasurements();
    });


});