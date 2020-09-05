$(function () {
 //    var data = [{
 //    "address": {
 //        "addressCountry": "Switzerland",
 //        "adressLocality": "Carouge",
 //        "streetAddress": "Place de Sardaigne",
 //        "location": {
	// 	"latitude": 46.18937880783666,
	// 	"longitude": 6.13470161411795
	//      }
 //    },
 //    "category": [
 //        "urbanTreeSpot"
 //    ],
 //    "dateLastWatering": "2017-03-31T08:00",
 //    "dateModified": "2017-03-31T08:00",
 //    "id": "urn:ngsi-ld:FlowerBed:FlowerBed-1",
 //    "box_id": "Box 1",
 //    "nextWateringDeadline": "2017-04-31T08:00",
 //    "watering_amount_recomendation": 3,
 //    "watering_date_time_recomendation":"2017-04-31T08:00",
 //    "box_tensiometer": 20,
 //    "box_humidity": 0.85,
 //    "box_temperature": 20,
 //    "box_soil_type": "Soil Type 1",
 //    "box_flower_type": "Flower Type 1",
 //    "box_sun_exposure": "sun",
 //    "box_wind_exposure": "wind",
 //    "dateInstallation": "2017-03-31T08:00",
 //    "box_size": 5,
 //    "type": "FlowerBed"
 //    },
 //    {
 //    "address": {
 //        "addressCountry": "Switzerland",
 //        "adressLocality": "Carouge",
 //        "streetAddress": "Place de Sardaigne",
 //        "location": {
	// 	"latitude": 46.18937980783666,
	// 	"longitude": 6.12970161411795
	//      }
 //    },
 //    "category": [
 //        "urbanTreeSpot"
 //    ],
 //    "dateLastWatering": "2017-03-31T08:00",
 //    "dateModified": "2017-03-31T08:00",
 //    "id": "urn:ngsi-ld:FlowerBed:FlowerBed-2",
 //    "box_id": "Box 2",
 //    "nextWateringDeadline": "2017-04-31T08:00",
 //    "watering_amount_recomendation": 1,
 //    "watering_date_time_recomendation":"2017-04-31T08:00",
 //    "box_tensiometer": 20,
 //    "box_humidity": 0.85,
 //    "box_temperature": 20,
 //    "box_soil_type": "Soil Type 1",
 //    "box_flower_type": "Flower Type 1",
 //    "box_sun_exposure": "sun",
 //    "box_wind_exposure": "wind",
 //    "dateInstallation": "2017-03-31T08:00",
 //    "box_size": 5,
 //    "type": "FlowerBed"
 // }];
    window.NaiadesMap = {
        initMap: function() {

        },

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
            window.NaiadesRender.render(measurements)
        },

        isSetup: function(meter) {
            if ((!meter.soilType) || (!meter.flowerType) || (!meter.sunExposure) || (!meter.boxSize)) {
                return false;
            }

            return true;
        },

        load: function() {
            // setup filter events
            //this.setupFilters();

            // initialize renderer
            window.NaiadesRender.initialize();

            // load data
            this.loadData();
        },

    };

    // run map component
    NaiadesMap.load();

    // attach reload on watering type change
    $('#next-watering').on('change', function() {
        NaiadesMap.showFilteredMeasurements();
    })
});