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
            this.map = L.map('mapid').setView([46.1838136, 6.138625], 15);

            L.tileLayer(
                'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: 'pk.eyJ1IjoiZXZhbmdlbGllOTAiLCJhIjoiY2thanU1YzFrMGU5MDJ6anVtY3FpdDQwaiJ9.G5trmcJe4LgebhQxVzgVMw'
                }
            ).addTo(this.map);
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

                    that.fetchedMeasurements = boxes;
                    that.measurements = boxes;

                    // filter & show
                    that.showFilteredMeasurements();
                }
            });
        },

        showFilteredMeasurements: function() {

            // show on map
            this.showData();
        },

        getPopupContent: function(meter, consumption) {
            const that = this;

            return $("<div />")
                .addClass("popup-content")
                .append($(`<div class="prop-label">Box Name:</div><div class="prop-value">${meter.box_id}</></div><br>`))
                .append($(`<div class="prop-label">Type of soil:</div><div class="prop-value"> ${meter.box_soil_type}</div><br>`))
                .append($(`<div class="prop-label">Type of flowers:</div><div class="prop-value">${meter.box_flower_type}</div><br>`))
                .append($(`<div class="prop-label">Exposure of sun:</div><div class="prop-value"> ${meter.box_sun_exposure}</div><br>`))
                .append($(`<div class="prop-label">Date of box installation:</div><div class="prop-value">${meter.dateInstallation}</div><br>`))
                .append($(`<div class="prop-label">Box size:</div><div class="prop-value">${meter.box_size}</div><br>`))
                //.append($('<div class="prop-label consumption-label">Amount of water:</div>'))
                //.append($(`<div class="consumption">${consumption} m<sup>3</sup></div>`))
                //.append($('<div class="prop-label">Box Id:</div>'))
                //.append($(`<div class="prop-value">${meter.box_id}</div>`))
                //.append($(`<a href="#" class="action">More Details</a>`))
                .append($(`<button class="btn btn-primary btn-sm action btn--first">More Details</button>`)
                    .on("click", function() {
                        location.href=`/watering/details?id=${meter.box_id}`
                    })
                )
                .append($(`<button class="btn btn-default btn-sm action">Report Problem</button>`)
                    .on("click", function() {
                        //that.addToMeterChart(meter)
                        location.href='/watering/report'
                    })
                )
                .get(0)
        },

        showData: function() {
            const map = this.map;

            // get max consumption
            //const maxConsumption = this.getMaxConsumption();

            const that = this;
            $.each(this.measurements, function(idx, measurement) {
                //const meter = measurement.box_id;

                // calculate color
                //const color = getGreenRedScaleColor(measurement.totalConsumption / maxConsumption);
                const color = '#8EC760';

                // create point
                measurement.point = L.circle([measurement.address.location.latitude, measurement.address.location.longitude], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    radius: 20
                }).addTo(map).on("click", function(e) {
                    const clickedCircle = e.target;
                    const consumption = measurement
                        .watering_amount_recomendation
                        .toLocaleString('en-US', {maximumFractionDigits:0});

                    clickedCircle
                        .bindPopup(that.getPopupContent(measurement, consumption))
                        .openPopup();
                });

            });
        },

        load: function() {
            // setup filter events
            //this.setupFilters();

            // initialize map component
            this.initMap();

            // load data
            this.loadData();
        },

    };

    // run map component
    NaiadesMap.load();
});