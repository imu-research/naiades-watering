$(function() {
    function renderChartData(boxId, data, divideBy) {
        const title = (
            divideBy
            ? "Periodic Water Consumption (Avg. per Box)"
            : "Periodic Water Consumption (Cluster)"
        );

        // divide all data
        $.each(data, function(idx, datum) {
            $.each(["consumption", "prediction", "duration"], function(jdx, prop) {
                if (datum[prop]) {
                    datum[prop] /= (divideBy || 1);
                }
            })
        });

        AmCharts.makeChart(`chart-data${divideBy ? "-per-box" : ""}-${boxId}`, {
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
            "valueAxes": [{
                "id": "distanceAxis",
                "axisAlpha": 0,
                "gridAlpha": 0,
                "position": "left",
                 "title": "Consumption",
            },
                {
                    "id": "durationAxis",
                     "position": "right",
                     "title": "Watering time",
                }
                ],
            "graphs": [{
                /*"bullet": "circle",
                "bulletBorderAlpha": 1,
                "bulletBorderThickness": 1,*/
                "alphaField": "alpha",
                "balloonText": "[[value]] lt",
                "dashLengthField": "dashLength",
                //"fillAlphas": 0,
                "fillAlphas": 0.7,
                "legendPeriodValueText": "total: [[value.sum]] lt",
                "legendValueText": "[[value]] lt",
                "title": "Water Consumption",
                "type": "column",
                "valueField": "consumption",
                "valueAxis": "distanceAxis"
            }, {
                "bullet": "square",
                "bulletBorderAlpha": 1,
                "bulletBorderThickness": 1,
                "alphaField": "alpha",
                "balloonText": "[[value]] lt",
                //"type": "column",
                "dashLengthField": "dashLength",
                "dashLength": 10,
                "legendPeriodValueText": "total: [[value.sum]] lt",
                "legendValueText": "[[value]] lt",
                "title": "Predicted Water Consumption ",
                "fillAlphas": 0,
                //"fillAlphas": 0.6,
                "valueField": "prediction",
                "valueAxis": "distanceAxis"
            }, {
            "bullet": "circle",
            "bulletBorderAlpha": 1,
            "bulletBorderThickness": 1,
            "dashLengthField": "dashLength",
            "legendValueText": "[[value]]",
             "legendPeriodValueText": "total: [[value.sum]]",
            "title": "Watering time",
            "fillAlphas": 0,
            "valueField": "duration",
            "valueAxis": "durationAxis"
        }
            ],
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
                "menu": []
            }
        });
    }
    // get monthly report data
    $.get({
        url: "/watering/monthlyReport/data/",
        success: function({data}) {
            $.each(data, function(idx, boxData) {
                const boxId = boxData["box_id"];

                renderChartData(boxId, boxData["data"]);
                renderChartData(boxId, boxData["data"], $(`#box-container-${boxId}`).data("nboxes"))
            });
        }
    });
});