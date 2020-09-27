$(function () {
    window.NaiadesWateringData = {

        // state management
        fetchedMeasurements: null,
        measurements: null,

        // filters
        selectedActivityType: '',

        loadData: function() {
            const that = this;
            $.ajax({
                url: '/watering/api/boxes/list',
                success: function(response) {
                    const boxes = response.boxes;
                    const today = new Date();

                    $.each(boxes, function(idx, box) {
                        // check if setup
                        box.isSetup = that.isSetup(box);

                        // set next watering
                        box.nextWatering = 'UNKNOWN';
                        if (!box.nextWateringDeadline) {
                            return
                        }

                        const parts = box.nextWateringDeadline.split('T')[0].split('-');

                        // get watering
                        const nextWateringDate = new Date(
                            Number.parseInt(parts[0]),
                            Number.parseInt(parts[1]) - 1,
                            Number.parseInt(parts[2])
                        );

                        // same date?
                        if ((nextWateringDate.getFullYear() === today.getFullYear()) &&
                            (nextWateringDate.getMonth() === today.getMonth()) &&
                            (nextWateringDate.getDate() === today.getDate())) {
                            box.nextWatering = 'TODAY';
                        }

                        // next date?
                        // TODO improve check - this fails for the last day of the month
                        else if ((nextWateringDate.getFullYear() === today.getFullYear()) &&
                            (nextWateringDate.getMonth() === today.getMonth()) &&
                            (nextWateringDate.getDate() - 1 === today.getDate())) {
                            box.nextWatering = 'TOMORROW';
                        }

                        // in the past?
                        else if (nextWateringDate < today) {
                            box.nextWatering = 'UNKNOWN';
                        }
                        else {
                            // just future
                            box.nextWatering = 'FUTURE';
                        }

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
            const measurements = this.measurements
                .filter(box => nextWatering === "" || box.nextWatering === nextWatering);

            // show points
            window.NaiadesRender.render(measurements);
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

    // run map component
    NaiadesWateringData.load();

    // attach reload on watering type change
    $('#next-watering').on('change', function() {
        NaiadesWateringData.showFilteredMeasurements();
    });


});