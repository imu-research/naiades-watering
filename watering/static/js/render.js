$(function () {
    window.NaiadesRender = {
        mode: window.RENDERING_MODE,
        containerId: 'container',

        initializeMap: function() {
            this.map = L.map(this.containerId).setView([46.1838136, 6.138625], 15);

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

        initializeList: function() {
            // TODO initialize table
            this.$table = $('<table class="table" id="StatusTable">\n' +
                '                <thead>\n' +
                '                  <tr>\n' +
                '                    <th>Name</th>\n' +
                '                    <th>Humidity Level</th>\n' +
                '                    <th>Amount of watering</th>\n' +
                '                    <th>Next watering</th>\n' +
                '                    <th>Problems</th>\n' +
                '                  </tr>\n' +
                '                </thead>\n' +
                '                <tbody></tbody>' +
                '             </table>'
            );

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
                .append($(`<div class="prop-label">Installation date:</div><div class="prop-value">${meter.installationDate || '-'}</div><br>`))
                .append($(`<div class="prop-label">Box size:</div><div class="prop-value">${meter.boxSize || '-'}</div><br>`))
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
                const point = L.circle([measurement.location.coordinates[1], measurement.location.coordinates[0]], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    radius: 20
                }).addTo(map).on("click", function(e) {
                    const clickedCircle = e.target;

                    clickedCircle
                        .bindPopup(that.getPopupContent(measurement))
                        .openPopup();
                });

                // add to items
                that.items.push(point);
            });
        },

        renderList: function(measurements) {
            const that = this;

            const nextWateringMessages = {
                "TODAY": "Today",
                "TOMORROW": "Tomorrow",
                "FUTURE": "Later than tomorrow",
                "UNKNOWN": "Unknown"
            };

            $.each(measurements, function(idx, meter) {
                //const meter = measurement.box_id;

                // calculate color
                const color = that.getMeterColor(meter);

                // create row
                const $row = $('<tr />')
                    .append(
                        $('<td />').append(
                            $('<a />')
                                .attr('href', `/watering/details/?id=${meter.boxId}`)
                                .text(`Box #${meter.boxId}`)
                        )
                    )
                    .append(
                        $('<td />').text(`${meter.soilMoisture.toFixed(2) || '-'}`)
                    )
                    .append(
                        $('<td />').html(`${meter.nextWateringAmountRecommendation} m<sup>3</sup>`)
                    )
                    .append(
                        $('<td />').append($('<div />')
                            .addClass('next-watering-label')
                            .css('background-color', color)
                            .text(nextWateringMessages[meter.nextWatering] + (
                                meter.isSetup ? '' : ' - Setup Box'
                            ))
                        )
                    )
                    .append(
                        $('<td />')
                            .append(
                                $('<a />')
                                    .attr('href', `/watering/box/${meter.boxId}/issues/`)
                                    .addClass('btn btn-sm btn-primary')
                                    .attr('title', 'List problems')
                                    .css('margin-right', '5px')
                                    .append($('<i class="glyphicon glyphicon-list"></i>'))
                            )
                            .append(
                                $('<a />')
                                    .attr('href', `/watering/box/${meter.boxId}/issues/report/`)
                                    .addClass('btn btn-sm btn-warning')
                                    .attr('title', 'Report new problem')
                                    .append($('<i class="glyphicon glyphicon-plus"></i>'))
                            )
                    );

                // add to items
                that.items.push($row);

                // show
                that.$table.find('tbody').append($row);
            });
        },

        render: function(measurements) {
            if (this.mode === "map") {
                return this.renderMap(measurements);
            }

            return this.renderList(measurements);
        }
    }
});