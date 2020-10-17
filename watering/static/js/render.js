$(function () {
    window.NaiadesRender = {
        mode: window.RENDERING_MODE,
        containerId: 'container',

        initializeMap: function() {
            this.map = L.map(this.containerId).setView([46.1838136, 6.138625], 15);

            L.tileLayer(
                //'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
                    //attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 20,
                    //id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    subdomains:['mt0','mt1','mt2','mt3'],
                    //accessToken: 'pk.eyJ1IjoiZXZhbmdlbGllOTAiLCJhIjoiY2thanU1YzFrMGU5MDJ6anVtY3FpdDQwaiJ9.G5trmcJe4LgebhQxVzgVMw'
                }
            ).addTo(this.map);

            // on map click, capture position
            this.map.on('click', function(e){
                console.log(e.latlng);
            });
        },

        initializeList: function() {
            // TODO initialize table
            this.$table = $('<div id="StatusTable" />');

            // add table to container
            $(`#${this.containerId}`).append(this.$table);
        },

        initialize: function() {
            this.items = [];

            if (this.mode === "map") {
                return this.initializeMap();
            }

            return this.initializeList();
        },

        clear: function() {
            $.each(this.items, function(idx, item) {
                item.remove();
            });
        },

        getMeterColor: function(meter) {
            if (!meter.isSetup) {
                return '#F6BB42';
            }

            // watered today
            if (meter.lastWatering === 'TODAY') {
                return '#8EC760';
            }

            // need watering today
            if (meter.nextWatering === 'TODAY') {
                return '#E9573F';
            }

            // unknown next watering (e.g empty or day in past)
            if (meter.nextWatering === 'UNKNOWN') {
                return '#AAB2BD';

            }

            // green - watering in future date
            return '#8EC760';
        },

        getPopupContent: function(meter) {
            const that = this;
            if (!meter.isSetup) {
                return $("<div />")
                    .addClass("popup-content")
                    .append($(`<div class="prop-label">Box ID:</div><div class="prop-value">${meter.boxId}</></div><br>`))
                    .append($(`<button class="btn btn-block btn-sm action btn--first">Set up the box</button>`)
                        .on("click", function () {
                            location.href = `/watering/edit?id=${meter.boxId}`
                        })
                    )
                    .get(0);
            }

            return $("<div />")
                .addClass("popup-content")
                .append($(`<div class="prop-label">Box ID:</div><div class="prop-value">${meter.boxId}</></div><br>`))
                .append($(`<div class="prop-label">Last watering:</div><div class="prop-value"> ${meter.dateLastWatering || '-'}</div><br>`))
                .append($(`<div class="prop-label">Next watering:</div><div class="prop-value"> ${meter.nextWateringDeadline || '-'}</div><br>`))
                .append($(`<div class="prop-label">Soil type:</div><div class="prop-value"> ${meter.soilType || '-'}</div><br>`))
                .append($(`<div class="prop-label">Flower type:</div><div class="prop-value">${meter.flowerType || '-'}</div><br>`))
                .append($(`<div class="prop-label">Sun exposure:</div><div class="prop-value"> ${meter.sunExposure || '-'}</div><br>`))
                // .append($(`<div class="prop-label">Wind exposure:</div><div class="prop-value"> ${meter.windExposure || '-'}</div><br>`))
                //.append($(`<div class="prop-label">Installation date:</div><div class="prop-value">${meter.installationDate || '-'}</div><br>`))
                //.append($(`<div class="prop-label">Box size:</div><div class="prop-value">${meter.boxSize || '-'}</div><br>`))
                .append($(`<div class="prop-label">Humidity:</div><div class="prop-value">${meter.soilMoisture.toFixed(2) || '-'}</div><br>`))
                //.append($('<div class="prop-label consumption-label">Amount of water:</div>'))
                //.append($(`<div class="consumption">${consumption} m<sup>3</sup></div>`))
                //.append($('<div class="prop-label">Box Id:</div>'))
                //.append($(`<div class="prop-value">${meter.box_id}</div>`))
                //.append($(`<a href="#" class="action">More Details</a>`))
                .append($(`<button class="btn btn-primary btn-sm action btn--first">More Details</button>`)
                    .on("click", function() {
                        location.href=`/watering/details?id=${meter.boxId}`
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

        getIcon: function(color) {
            const colorCode = {
                '#F6BB42': 'orange',
                '#E9573F': 'red',
                '#AAB2BD': 'grey',
                '#8EC760': 'green',
            }[color];

            return new L.Icon({
                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colorCode}.png`,
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
        },

        renderMap: function(measurements) {
            const map = this.map;

            // get max consumption
            //const maxConsumption = this.getMaxConsumption();

            const that = this;
            $.each(measurements, function(idx, measurement) {
                //const meter = measurement.box_id;

                // calculate color
                const color = that.getMeterColor(measurement);

                // create point
                const point = L.marker([measurement.location.coordinates[1], measurement.location.coordinates[0]], {
                    icon: that.getIcon(color),
                    color: '#555',
                    fillColor: color,
                    fillOpacity: 0.8,
                    radius: 30
                }).addTo(map).on("click", function(e) {
                    const clickedCircle = e.target;
                    if (!clickedCircle._popup) {
                        clickedCircle
                            .bindPopup(that.getPopupContent(measurement))
                            .openPopup();
                    }
                });

                // add to items
                that.items.push(point);
            });
        },

        renderList: function(measurements) {
            const that = this;

            const nextWateringMessages = {
                "TODAY": window.MESSAGES.today,
                "TOMORROW": window.MESSAGES.tomorrow,
                "FUTURE": "Later than tomorrow",
                "UNKNOWN": "Unknown"
            };

            // for each next watering indication
            $.each(["TODAY", "TOMORROW", "FUTURE", "UNKNOWN"], function(wmx, nextWatering) {
                // select measurements with this next watering indication
                const filteredMeasurements = measurements.
                    filter(meter => meter.nextWatering === nextWatering);

                $.each(filteredMeasurements, function(idx, meter) {
                    //const meter = measurement.box_id;

                    // calculate color
                    const color = that.getMeterColor(meter);

                    // create row
                    const $entry = $('<div />')
                        .addClass("entry")
                        .addClass((idx === filteredMeasurements.length - 1) && "last")
                        .append(
                            $('<div />').
                                addClass("title").
                                append(
                                    $('<a />')
                                        .attr('href', `/watering/details/?id=${meter.boxId}`)
                                        .text(`Box #${meter.boxId}`)
                                )
                        )
                        .append(
                            $('<div />').text(`Humidity Level: ${meter.soilMoisture.toFixed(2) || '-'}`)
                        )
                        .append(
                            $('<div />')
                                .append($('<span />').text(
                                    meter.lastWatering !== "TODAY"
                                        ? "Suggested watering date: "
                                        : ""
                                ))
                                .append(
                                    meter.lastWatering !== "TODAY" &&
                                    ['TODAY', 'TOMORROW', 'FUTURE'].indexOf(meter.nextWatering) >= 0 &&
                                    $('<span />').text(meter.nextWateringDeadline.split("T")[0] || "-")
                                )
                                .append(
                                    $('<div />')
                                        .addClass(
                                            `next-watering-label ` +
                                            `${meter.nextWatering === "TODAY" && "watered-today"}`
                                        )
                                        .css('background-color', color)
                                        .text((
                                            meter.lastWatering !== "TODAY"
                                                ? `${nextWateringMessages[meter.nextWatering]}`
                                                : "Watered today ✓"
                                        )+ (
                                            !meter.isSetup ? ' - Setup Box' : ''
                                        ))
                                )
                                .append(
                                    meter.lastWatering !== "TODAY" &&
                                    meter.nextWateringAmountRecommendation &&
                                    meter.nextWateringAmountRecommendation.indexOf("1970-") !== 0 &&
                                    $('<div />')
                                        .text(
                                            `Suggested watering amount: ` +
                                            `${meter.nextWateringAmountRecommendation} lt`
                                        )
                                )
                        )
                        .append(
                            $('<div />')
                                .addClass("actions")
                                .append($('<div />')
                                    .addClass('btn-group')
                                    .append(
                                        $('<a />')
                                            .attr('href', `/watering/box/${meter.boxId}/issues/`)
                                            .addClass('btn btn-sm btn-default')
                                            .attr('title', window.MESSAGES.listProblems)
                                            .append($('<i class="glyphicon glyphicon-list" />'))
                                            .append($('<span />').text('Issues').css('margin-left', 5))
                                    )
                                    .append(
                                        $('<a />')
                                            .attr('href', `/watering/box/${meter.boxId}/issues/report/`)
                                            .addClass('btn btn-sm btn-default')
                                            .attr('title', 'Report new problem')
                                            .append($('<i class="glyphicon glyphicon-plus" />'))
                                            .append($('<span />').text('Report new issue').css('margin-left', 5))
                                    )
                                )
                        );

                    // add to items
                    that.items.push($entry);

                    // show
                    that.$table.append($entry);
                });
            });
        },

        render: function(measurements) {
            if (this.mode === "map") {
                return this.renderMap(measurements);
            }

            if (this.mode === "route") {
                return window.NaiadesRouter.renderRoute(measurements);
            }

            return this.renderList(measurements);
        }
    }
});