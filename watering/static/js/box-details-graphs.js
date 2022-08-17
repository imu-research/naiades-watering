$(function() {
    let nResponses = 0;
    const charts = [];

    const getHistory = function(data) {
        return AmCharts.makeChart("chart-history", {
            "type": "serial",
            "hideCredits":true,
            "theme": "none",
            "legend": {
                "useGraphSettings": true
            },
            "synchronizeGrid":true,
            "marginRight": 40,
            "marginLeft": 40,
            "autoMarginOffset": 20,
            "dataDateFormat": "YYYY-MM-DD"+'T'+"JJ:NN:SS.QQQ",
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": window.MESSAGES.humidityGraph
                }
            ],
            "valueAxes": [{
                "id": "v1",
                "axisColor": "#FF6600",
                "axisThickness": 2,
                "axisAlpha": 1,
                "position": "left",
                "title": "Water requirement (cb)",
            }, {
                "id":"v2",
                "axisColor": "#FCD202",
                "axisThickness": 2,
                "axisAlpha": 1,
                "position": "right",
                "title": "Humidity (%)",
            },
            ],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "valueAxis": "v1",
                "lineColor": "#FF6600",
                "bullet": "round",
                "bulletBorderThickness": 1,
                "hideBulletsCount": 30,
                "title": "Dragino Sensor",
                "valueField": "value_new",
                "legendValueText": "[[value]] %",
                "balloonText": "[[value]] %",
                "lineThickness": 1.5,
            "fillAlphas": 0
            }, {
                "valueAxis": "v2",
                "lineColor": "#FCD202",
                "bullet": "square",
                "bulletBorderThickness": 1,
                "hideBulletsCount": 30,
                "title": "Old Sensor",
                "valueField": "value_old",
                "legendValueText": "[[value]] cb",
                "balloonText": "[[value]] cb",
                "lineThickness": 1.5,
            "fillAlphas": 0
            }],
            "chartScrollbar": {
                "enable":true,
                "updateOnReleaseOnly": true
            },
            "chartCursor": {
                "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                "cursorPosition": "mouse"
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minorGridEnabled": true,
                "minPeriod": "mm",
                "axisColor": "#DADADA",
            },
            "export": {
                "enabled": true,
                "menu":[],
            },
            "dataProvider": data
        });
    };

    const getPrediction = function(data) {
        return AmCharts.makeChart("chart-prediction", {
            "type": "serial",
            "theme": "light",
            "hideCredits":true,
            "mouseWheelZoomEnabled":true,
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": window.MESSAGES.predictionGraph
                }
            ],
            "legend": {
                "equalWidths": false,
                "useGraphSettings": true,
                "valueAlign": "left",
                "valueWidth": 120
            },
            "dataProvider": data,
            "valueAxes": [{
                "id": "distanceAxis",
                "axisAlpha": 0,
                "gridAlpha": 0,
                "position": "left",
            }],
            "graphs": [{
                "alphaField": "alpha",
                "balloonText": "[[value]] lt",
                "dashLengthField": "dashLength",
                "fillAlphas": 0.7,
                "legendValueText": "[[value]] lt",
                "title": window.MESSAGES.actual,
                "type": "column",
                "valueField": "value_old",
                "valueAxis": "distanceAxis"
            }, {
                "alphaField": "alpha",
                "balloonText": "[[value]] lt",
                "type": "column",
                "dashLengthField": "dashLength",
                "legendValueText": "[[value]] lt",
                "title": window.MESSAGES.predicted,
                "fillAlphas": 0.6,
                "valueField": "value_new",
                "valueAxis": "distanceAxis"
            }],
            "chartCursor": {
                "categoryBalloonDateFormat": "DD",
                "cursorAlpha": 0.1,
                "cursorColor":"#000000",
                "fullWidth":true,
                "valueBalloonsEnabled": false,
                "zoomable": true

            },
            "dataDateFormat": "YYYY-MM-DD",
            "categoryField": "date",
            "categoryAxis": {
                "dateFormats": [{
                    "period": "DD",
                    "format": "DD"
                }, {
                    "period": "WW",
                    "format": "MMM DD"
                }, {
                    "period": "MM",
                    "format": "MMM"
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
                "menu":[]
             }
        });
    };

    const getECHistory = function(data) {
        AmCharts.makeChart("chart-ec", {
            "type": "serial",
            "hideCredits":true,
            "theme": "none",
            "marginRight": 40,
            "marginLeft": 60,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled":true,
            "dataDateFormat": "YYYY-MM-DD"+'T'+"JJ:NN:SS.QQQ",
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": window.MESSAGES.electroconductivity
                }
            ],
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "ignoreAxisWidth":true,
                "axisColor": "#67b7dc",
                "title": "EC (S/m)",
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "id": "g1",
                "lineColor": "#67b7dc",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value",
                "balloonText": "<span style='font-size:12px;'>[[value]] "+"S/m"+"</span>"
            }],
             "chartCursor": {
                 "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                 "cursorPosition": "mouse",
                 "cursorColor": "#67b7dc"
             },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minorGridEnabled": true,
                "minPeriod": "mm"
            },
            "export": {
                "enabled": true,
                "menu":[],
            },
            "dataProvider": data
        });
    };

    const getSoilHistory = function(data) {
        AmCharts.makeChart("chart-soil-temp", {
            "type": "serial",
            "hideCredits":true,
            "theme": "light",
            "marginRight": 40,
            "marginLeft": 60,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled":true,
            "dataDateFormat": "YYYY-MM-DD"+'T'+"JJ:NN:SS.QQQ",
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": window.MESSAGES.soilTemp
                }
            ],
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "ignoreAxisWidth":true,
                "axisColor": "#67b7dc",
                "title": "Soil temperature (°C)"
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "id": "g1",
                "lineColor": "#ff0000",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value",
                "balloonText": "<span style='font-size:18px;'>[[value]]"+"°C"+"</span>"
            }],
             "chartCursor": {
                 "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                 "cursorPosition": "mouse",
                 "cursorColor": "#ff0000"
             },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minorGridEnabled": true,
                "minPeriod": "mm"
            },
            "export": {
                "enabled": true,
                "menu":[],
            },
            "dataProvider": data,
        });
    };

    const getBattery = function(data) {
        AmCharts.makeChart("chart-battery", {
            "type": "serial",
            "hideCredits":true,
            "theme": "none",
            "legend": {
                "useGraphSettings": true
            },
            "synchronizeGrid":true,
            "marginRight": 40,
            "marginLeft": 40,
            "autoMarginOffset": 20,
            "dataDateFormat": "YYYY-MM-DD"+'T'+"JJ:NN:SS.QQQ",
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": window.MESSAGES.battery
                }
            ],
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "title": "Battery (%)",
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "valueAxis": "v1",
                "lineColor": "#FF6600",
                "bullet": "round",
                "bulletBorderThickness": 1,
                "hideBulletsCount": 30,
                "title": "Dragino Sensor",
                "valueField": "value_new",
                "legendValueText": "[[value]] %",
                "balloonText": "[[value]] %",
                "lineThickness": 1.5,
                "fillAlphas": 0
            }, {
                "valueAxis": "v2",
                "lineColor": "#FCD202",
                "bullet": "square",
                "bulletBorderThickness": 1,
                "hideBulletsCount": 30,
                "title": "Old Sensor",
                "valueField": "value_old",
                "legendValueText": "[[value]] %",
                "balloonText": "[[value]] %",
                "lineThickness": 1.5,
                "fillAlphas": 0
            }],
            "chartCursor": {
                "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                "cursorPosition": "mouse"
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minorGridEnabled": true,
                "minPeriod": "mm",
                "axisColor": "#DADADA",
            },
            "export": {
                "enabled": true,
                "menu":[],
            },
            "dataProvider": data
        });
    };

    const showWateringLogs = function(logs) {
        window.WATERING_LOGS = logs;

        const $table = $("#watering-logs-table");

        $table
            .find("tbody")
            .empty();

        // add rows for each watering log
        $.each(logs, function(idx, log) {
            const $tr = $("<tr />");

            $tr
                .append($("<td />").text(log.date))
                .append($("<td />").text(log.value_old !== null ? Math.round(log.value_old * 10) / 10 : "-"))
                .append($("<td />").text(log.value_new !== null ? Math.round(log.value_new * 10) / 10 : "-"));

            $table
                .find("tbody")
                .append($tr);
        });

        // enable datatable
        $('#watering-logs-table').DataTable({
            "order": [[ 0, "desc" ]],
            "bFilter": false,
            "info": false,
            "ordering": false,
            "bLengthChange": false,
            "pageLength":10
        });
    };

    // check empty data method
    AmCharts.checkEmptyData = function (chart) {
        if (chart.dataProvider.length === 0) {
            // set min/max on the value axis
            chart.valueAxes[0].minimum = 0;
            chart.valueAxes[0].maximum = 100;

            // add dummy data point
            const dataPoint = {
                dummyValue: 0
            };
            dataPoint[chart.categoryField] = '';
            chart.dataProvider = [dataPoint];

            // add label
            chart.addLabel(0, '50%', window.MESSAGES.noData, 'center');

            // set opacity of the chart div
            chart.chartDiv.style.opacity = 0.5;

            // redraw it
            chart.validateNow();
        }
    };

    // on chart zoom, update all charts
    const handleChartZoomed = function (event) {
        $.each(charts, function(idx, chart) {
            if (chart.ignoreZoom) {
                chart.ignoreZoom = false;
            }

            if (event.chart !== chart) {
                chart.ignoreZoom = true;
                chart.zoomToDates(event.startDate, event.endDate);
            }
        });
    };

    const requestItems = [
        {
            metric: "history", method: getHistory
        },
        {
            metric: "prediction", method: getPrediction
        },
        {
            metric: "ec-history", method: getECHistory,
        },
        {
            metric: "soil-history", method: getSoilHistory,
        },
        {
            metric: "battery", method: getBattery
        }
    ];

    const handleResponse = function() {
        // add handlers to all charts
        nResponses += 1;
        if (nResponses === requestItems.length) {
            // add listener to each chart
            $.each(charts, function(idx, chart) {
                chart.addListener("zoomed", handleChartZoomed);
            });
        }
    };

    // show as loading
    const placeholders = ["history", "prediction", "ec", "soil-temp", "battery"];
    $.each(
        placeholders,
        function(idx, placeholderId) {
            $(`#chart-${placeholderId}`).append(
                $('<div style="text-align:center;padding-top: 100px;">Loading...</div>')
            );
        }
    );

    // GET all requests & populate charts
    $.each(requestItems, function(idx, item) {
       $.ajax({
           url: `/watering/details/${item.metric}/?id=${window.BOX_ID}`,
           type: "GET",
           success: function(data) {
               // remove loading
               $(`#chart-${placeholders[idx]}`).empty();

               // add longs alongside with prediction
               if (item.metric === "prediction") {
                   showWateringLogs(data.logs);
                   data = data.prediction;
               }

               // create chart
               const chart = item.method(data);

               // check if empty for history chart
               if (item.metric === "history") {
                  AmCharts.checkEmptyData(chart);
               }

               // add chart
               charts.push(chart);

               // handle success response
               handleResponse();
           },
           error: function() {
               // handle fail response
               handleResponse();
           }
       })
    });
});




