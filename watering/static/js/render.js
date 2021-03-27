$(function () {
    window.NaiadesRender = {
        mode: window.RENDERING_MODE,
        containerId: 'container',
        mapContainerId: 'map-container',

        createMapContainer: function() {
            const $mapContainer = $('<div />')
                .attr("id", this.mapContainerId);

            // append map container
            $(`#${this.containerId}`).append($mapContainer);

            return $mapContainer
        },

        initializeMap: function() {
            // create map container
            this.createMapContainer();

            // initialize map
            this.map = L.map(this.mapContainerId).setView([46.1838136, 6.138625], 15);

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

        initializeRoute: function() {
            this.createMapContainer();
        },

        initializeList: function() {
            // TODO initialize table
            this.$table = $('<div id="StatusTable" />');

            // add table to container
            $(`#${this.containerId}`).append(this.$table);
        },

        initialize: function() {
            this.items = [];
            this.points = [];

            if (this.mode.indexOf("map") >= 0) {
                this.initializeMap();
            }

            if (this.mode.indexOf("route") >= 0) {
                this.initializeRoute();
            }

            if (this.mode.indexOf("list") >= 0) {
                this.initializeList();
            }
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
                    .append($(`<div class="prop-label">${window.MESSAGES.boxId}:</div><div class="prop-value">${meter.boxId}</></div><br>`))
                    .append($(`<button class="btn btn-block btn-sm action btn--first">${window.MESSAGES.setup2}</button>`)
                        .on("click", function () {
                            location.href = `/watering/edit?id=${meter.boxId}`
                        })
                    )
                    .get(0);
            }

            return $("<div />")
                .addClass("popup-content")
                .append($(`<div class="prop-label">${window.MESSAGES.boxId}:</div><div class="prop-value">${meter.boxId}</></div><br>`))
                .append($(`<div class="prop-label">${window.MESSAGES.lastWatering}:</div><div class="prop-value"> ${meter.dateLastWatering || '-'}</div><br>`))
                .append($(`<div class="prop-label">${window.MESSAGES.nextWatering}:</div><div class="prop-value"> ${meter.nextWateringDeadline || '-'}</div><br>`))
                .append($(`<div class="prop-label">${window.MESSAGES.soil_type}:</div><div class="prop-value"> ${meter.soil_type.replace("soil", "") || '-'}</div><br>`))
                .append($(`<div class="prop-label">${window.MESSAGES.flowerType}:</div><div class="prop-value">${meter.flowerType || '-'}</div><br>`))
                .append($(`<div class="prop-label">${window.MESSAGES.sunExposure}:</div><div class="prop-value"> ${meter.sunExposure || '-'}</div><br>`))
                .append($(`<div class="prop-label">${window.MESSAGES.humidity}:</div><div class="prop-value">${meter.soilMoisture.toFixed(2) || '-'}</div><br>`))
                .append($('<a />')
                    .attr('href', `/watering/details?id=${meter.boxId}`)
                    .addClass('btn btn-primary btn-sm action btn--first')
                    .css('color', '#fff')
                    .text(window.MESSAGES.moreDetails)
                )
                .append($('<a />')
                    .attr('href', `/watering/box/${meter.boxId}/issues/report/`)
                    .addClass('btn btn-default btn-sm action')
                    .text(window.MESSAGES.reportProblem)
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

        renderMap: function(flowerbeds) {
            const map = this.map;

            // get max consumption
            //const maxConsumption = this.getMaxConsumption();

            const that = this;
            $.each(flowerbeds, function(idx, flowerbed) {
                // calculate color
                const color = that.getMeterColor(flowerbed);

                // create point if sensor data is provided
                if (flowerbed.sensor) {
                    const sensorLocation = flowerbed.sensor.location;

                    const point = L.marker([sensorLocation[0], sensorLocation[1]], {
                        icon: that.getIcon(color),
                        color: '#555',
                        fillColor: color,
                        fillOpacity: 0.8,
                        radius: 30,
                        title:`${flowerbed.boxId}`
                    }).addTo(map).on("click", function(e) {
                        const clickedCircle = e.target;
                        if (!clickedCircle._popup) {
                            clickedCircle
                                .bindPopup(that.getPopupContent(flowerbed))
                                .openPopup();
                        }

                        // mark as selected & scroll to the respective entry
                        const $table = window.NaiadesRender.$table;

                        if (!$table.length) {
                            return
                        }

                        $table
                            .find("> .entry")
                            .removeClass("selected");

                        $table
                            .find(`.entry[data-id=${flowerbed.boxId}]`)
                            .addClass("selected")
                            .get(0)
                            .scrollIntoView();
                    });

                    // add to items
                    that.items.push(point);
                    //add to points
                    that.points.push(point)
                }

                // create flowerbed polygon
                const polygon = L.geoJSON([{
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            flowerbed.location.map(position => [
                                position.lat, position.long
                            ])
                        ]
                    }
                }], {
                    color: color,
                    fillOpacity: 0.8,
                }).addTo(map);

                // add to items
                that.items.push(polygon);
            });
        },

        renderList: function(measurements) {
            const that = this;

            const nextWateringMessages = {
                "TODAY": window.MESSAGES.today,
                "TOMORROW": window.MESSAGES.tomorrow,
                "DAY_AFTER_TOMORROW": window.MESSAGES.day_after_tomorrow,
                "FUTURE": window.MESSAGES.future,
                "UNKNOWN": window.MESSAGES.unknown
            };

            // empty message
            if (!measurements.length) {
                return that.$table.append($('<div />')
                    .addClass("boxes--empty-message")
                    .text(`No boxes need watering ${$('#next-watering').val().toLowerCase()}.`)
                )
            }

            function markerFunction(id, meter){
                for (var i in that.points) {
                    if(that.points[i].options) {
                        var markerID = that.points[i].options.title;
                        if (markerID == id){
                            that.points[i].bindPopup(that.getPopupContent(meter)).openPopup();
                        }
                    }
                }
            }
            // for each next watering indication
            $.each(["TODAY", "TOMORROW", "DAY_AFTER_TOMORROW", "FUTURE", "UNKNOWN"], function(wmx, nextWatering) {
                // select measurements with this next watering indication
                const filteredMeasurements = measurements.
                    filter(meter => meter.nextWatering === nextWatering);

                $.each(filteredMeasurements, function(idx, meter) {
                    // calculate color
                    const color = that.getMeterColor(meter);

                    // create row
                    const $entry = $('<div />')
                        .addClass("entry")
                        .attr("data-id", meter.boxId)
                        .on("click", function() {
                            markerFunction(meter.boxId, meter)
                        })
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
                            $('<div />').text(window.MESSAGES.humidityLevel+` : ${meter.soilMoisture.toFixed(2) || '-'}`)
                        )
                        .append(
                            $('<div />')
                                .append($('<span />').text(
                                    meter.lastWatering !== "TODAY"
                                        ? window.MESSAGES.date+": "
                                        : ""
                                ))
                                .append(
                                    meter.lastWatering !== "TODAY" &&
                                    ['TODAY', 'TOMORROW', 'DAY_AFTER_TOMORROW', 'FUTURE'].indexOf(meter.nextWatering) >= 0 &&
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
                                                : window.MESSAGES.watered+" ✓"
                                        )+ (
                                            !meter.isSetup ? ' - '+window.MESSAGES.setup+'' : ''
                                        ))
                                )
                                .append(
                                    meter.lastWatering !== "TODAY" &&
                                    meter.nextWateringAmountRecommendation &&
                                    meter.nextWateringAmountRecommendation.indexOf("1970-") !== 0 &&
                                    $('<div />')
                                        .text(
                                            window.MESSAGES.amount+`: ` +
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
                                            .append($('<span />').text(window.MESSAGES.issues).css('margin-left', 5))
                                    )
                                    .append(
                                        $('<a />')
                                            .attr('href', `/watering/box/${meter.boxId}/issues/report/`)
                                            .addClass('btn btn-sm btn-default')
                                            .attr('title', window.MESSAGES.report)
                                            .append($('<i class="glyphicon glyphicon-plus" />'))
                                            .append($('<span />').text(window.MESSAGES.reportIssue).css('margin-left', 5))
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
            if (this.mode.indexOf("map") >= 0) {
                this.renderMap(measurements);
            }

            if (this.mode.indexOf("route") >= 0) {
                window.NaiadesRouter.renderRoute(measurements);
            }

            if (this.mode.indexOf("list") >= 0) {
                this.renderList(measurements);
            }
        }
    }
});