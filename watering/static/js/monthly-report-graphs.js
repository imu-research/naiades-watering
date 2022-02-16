$(function() {
    function getChartProps(type) {
        if (type === "report-data") {
            return {
                valueAxes: [
                    {
                        "id": "distanceAxis",
                        "axisAlpha": 0,
                        "gridAlpha": 0,
                        "position": "left",
                        "title": window.MESSAGES.consumption,
                    },
                    {
                        "id": "durationAxis",
                        "position": "right",
                        "title": window.MESSAGES.wateringTime,
                    }
                ],
                graphs: [
                    {
                        "alphaField": "alpha",
                        "balloonText": "[[value]] lt",
                        "dashLengthField": "dashLength",
                        "fillAlphas": 0.7,
                        "legendPeriodValueText": "total: [[value.sum]] lt",
                        "legendValueText": "[[value]] lt",
                        "title": window.MESSAGES.waterCons,
                        "type": "column",
                        "valueField": "consumption",
                        "valueAxis": "distanceAxis"
                    },
                    {
                        "bullet": "square",
                        "bulletBorderAlpha": 1,
                        "bulletBorderThickness": 1,
                        "alphaField": "alpha",
                        "balloonText": "[[value]] lt",
                        "dashLengthField": "dashLength",
                        "dashLength": 10,
                        "legendPeriodValueText": "total: [[value.sum]] lt",
                        "legendValueText": "[[value]] lt",
                        "title": window.MESSAGES.predCons,
                        "fillAlphas": 0,
                        "valueField": "prediction",
                        "valueAxis": "distanceAxis"
                    },
                    {
                        "bullet": "circle",
                        "bulletBorderAlpha": 1,
                        "bulletBorderThickness": 1,
                        "dashLengthField": "dashLength",
                        "legendValueText": "[[value]]",
                        "legendPeriodValueText": "total: [[value.sum]]",
                        "title": window.MESSAGES.wateringTime,
                        "fillAlphas": 0,
                        "valueField": "duration",
                        "valueAxis": "durationAxis"
                    }
                ]
            };
        }

        if (type === "distance-data") {
            return {
                valueAxes: [
                    {
                        "id": "distanceAxis",
                        "axisAlpha": 0,
                        "gridAlpha": 0,
                        "position": "left",
                        "title": "Distance driven (km)",
                    },
                ],
                graphs: [
                    {
                        "alphaField": "alpha",
                        "balloonText": "[[category]]: [[value]] km",
                        "dashLengthField": "dashLength",
                        "fillAlphas": 0.7,
                        "legendPeriodValueText": "total: [[value.sum]] km",
                        "legendValueText": "[[value]] km",
                        "title": window.MESSAGES.distance,
                        "type": "column",
                        "valueField": "total_distance",
                        "valueAxis": "distanceAxis"
                    }
                ]
            };
        }

        console.error(`Invalid chart type: "${type}".`)
    }

    function showChart(chartContainerId, type, title, data) {
        const props = getChartProps(type);

        AmCharts.makeChart(chartContainerId, {
            "type": "serial",
            "theme": "light",
            "hideCredits": true,
            "mouseWheelZoomEnabled": true,
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": title
                }
            ],
            "legend": {
                "equalWidths": false,
                "useGraphSettings": true,
                "valueAlign": "left",
                "valueWidth": 120
            },
            "dataProvider": data,
            "valueAxes": props.valueAxes,
            "graphs": props.graphs,
            "chartCursor": {
                "categoryBalloonDateFormat": "DD",
                "cursorAlpha": 0.1,
                "cursorColor": "#000000",
                "fullWidth": true,
                "valueBalloonsEnabled": false,
                "zoomable": true

            },
            "chartScrollbar": {
                "enable": true,
            },
            "dataDateFormat": "YYYY-MM-DD",
            "categoryField": "date",
            "categoryAxis": {
                "dateFormats": [{
                    "period": "DD",
                    "format": "DD/MM"
                }, {
                    "period": "WW",
                    "format": "MMM DD"
                }, {
                    "period": "MM",
                    "format": "MMM YYYY"
                }, {
                    "period": "YYYY",
                    "format": "YYYY"
                }],
                "parseDates": true,
                "autoGridCount": false,
                "axisColor": "#555555",
                "gridAlpha": 0.1,
                "gridColor": "#FFFFFF",
                "gridCount": 50
            },
            "export": {
                "enabled": true,
                "menu": []
            }
        });
    }

    function renderChartData(boxId, data, divideBy) {
        const title = (
            divideBy
            ? window.MESSAGES.periodicConsBox
            : window.MESSAGES.periodicConsCluster
        );

        // divide all properties
        $.each(data, function(idx, datum) {
            $.each(["consumption", "prediction", "duration"], function(jdx, prop) {
                if (datum[prop]) {
                    datum[prop] /= (divideBy || 1);
                }
            })
        });

        // show related chart
        showChart(
            `chart-data${divideBy ? "-per-box" : ""}-${boxId}`,
            "report-data",
            title,
            data
        );
    }

    function addToOverall(overallByDate, boxData) {
        $.each(boxData, function(idx, boxDatum) {
            // new date
            if (!overallByDate[boxDatum.date]) {
                overallByDate[boxDatum.date] = {
                    prediction: null,
                    consumption: null,
                    duration: null,
                    time_spent: null
                };
            }

            // for each property
            $.each(["prediction", "consumption", "duration", "time_spent"], function(pdx, prop) {
                // ignore if empty/unset/zero
                if (!boxDatum[prop]) {
                    return
                }

                // add value
                overallByDate[boxDatum.date][prop] = (overallByDate[boxDatum.date][prop] || 0) + boxDatum[prop];
            });
        });
    }

    function calculateTotal(data, prop) {
        prop = prop || "consumption";

        try {
            return data
                .map(entry => entry[prop])
                .filter(value => value && value)
                .reduce((a, b) => a + b);
        } catch(err) {
            return 0
        }
    }

    function renderEntity(boxId, boxData) {
        const $container = $(`#box-container-${boxId}`);
        const nBoxes = $container.data("nboxes");

        // show charts (total, by box)
        renderChartData(boxId, boxData.data);
        renderChartData(boxId, boxData.data, nBoxes);

        // calculate total consumption
        const totalConsumption = calculateTotal(boxData.data);
        const totalTimeSpent = calculateTotal(boxData.data, "time_spent");

        // show values
        $container
            .find("> .row > .metric:nth-of-type(1) .recommended-value")
            .text(`${totalConsumption.toFixed(2)} lt`);

        $container
            .find("> .row > .metric:nth-of-type(2) .recommended-value")
            .text(`${(totalConsumption / nBoxes).toFixed(2)} lt`);

        $container
            .find("> .row > .metric:nth-of-type(3) .recommended-value")
            .text(`${(totalTimeSpent).toFixed(0)} s`);

        $container
            .find("> .row > .metric:nth-of-type(4) .recommended-value")
            .text(`${(totalTimeSpent / nBoxes).toFixed(0)} s`);
    }

    function renderOverall(overallByDate) {
        // prepare values by date by reformatting into flat list
        const overallData = [];
        for (const date of Object.keys(overallByDate)) {
            // get & round all props to second decimal
            const dataValues = overallByDate[date];
            for (const prop of Object.keys(dataValues)) {
                dataValues[prop] = dataValues[prop] ? Math.round(dataValues[prop], 2) : dataValues[prop];
            }

            // add date & push
            dataValues.date = date;
            overallData.push(dataValues);
        }

        // render overall chart
        renderChartData("overall", overallData);

        // calculate total consumption & duration
        const totalConsumption = calculateTotal(overallData);
        const totalDuration = calculateTotal(overallData, "duration");
        const totalTimeSpent = calculateTotal(overallData, "time_spent");

        // show values
        const $container = $("#overall-values");

        $container
            .find("> .metric:nth-of-type(1) .recommended-value")
            .text(`${totalConsumption.toFixed(2)} lt`);

        $container
            .find("> .metric:nth-of-type(2) .recommended-value")
            .text(`${totalDuration.toFixed(2)} s`);

        $container
            .find("> .metric:nth-of-type(3) .recommended-value")
            .text(`${totalTimeSpent.toFixed(0)} s`);
    }

    // get monthly report data
    $.get({
        url: `/watering/monthlyReport/data/?from=${window.PERIOD_START}&to=${window.PERIOD_END}`,
        success: function({data}) {
            const overallByDate = {};

            $.each(data, function(idx, boxData) {
                const boxId = boxData.box_id;

                // populate charts for this entity
                renderEntity(boxId, boxData);

                // add to overall
                addToOverall(overallByDate, boxData.data);
            });

            renderOverall(overallByDate);
        }
    });

    // get location data
    $.get({
        url: `/watering/monthlyReport/distances/?from=${window.PERIOD_START}&to=${window.PERIOD_END}`,
        success: function({distances}) {
            showChart(
                'chart-km',
                "distance-data",
                "Total distance driven",
                distances
            );
        }
    });
});