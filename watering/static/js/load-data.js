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

                    $.each(boxes, function(idx, box) {

                        // set cluster position
                        if (box.location) {
                            box.location.position = box.location;
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

            if (!window.NaiadesRender) {
                return
            }

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

        load: function() {
            // initialize renderer
            if (window.NaiadesRender) {
                window.NaiadesRender.initialize();
            }

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