for (var i = 1; i < 9; i++) {
    var chart2 = AmCharts.makeChart("chart-prediction-"+i, {
        "type": "serial",
        "theme": "light",
        "hideCredits": true,
        "mouseWheelZoomEnabled": true,
        "titles": [
            {
                "id": "Title-1",
                "size": 15,
                "text": "Monthly Water Consumption"
            }
        ],
        "legend": {
            "equalWidths": false,
            "useGraphSettings": true,
            "valueAlign": "left",
            "valueWidth": 120
        },
        "dataProvider": [{
            "date": "2021-03-01",
            "actual": 20,
            "predicted": 22,
            "duration":3,
        }, {
            "date": "2021-03-02",
            "actual": 18,
            "predicted": 17
        }, {
            "date": "2021-03-03",
            "actual": 12,
            "predicted": 12
        }, {
            "date": "2021-03-04",
            "actual": 24,
            "predicted": 22
        }, {
            "date": "2021-03-05",
            "actual": 18,
            "predicted": 17
        }, {
            "date": "2021-03-06",
            "actual": 12,
            "predicted": 12
        }, {
            "date": "2021-03-07",
            "actual": 20,
            "predicted": 19
        }, {
            "date": "2021-03-08",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-09",
            "actual": 19,
            "predicted": 22
        }, {
            "date": "2021-03-10",
            "actual": 20,
            "predicted": 19
        }, {
            "date": "2021-03-11",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-12",
            "actual": 18,
            "predicted": 22
        }, {
            "date": "2021-03-13",
            "actual": 23,
            "predicted": 19
        }, {
            "date": "2021-03-14",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-15",
            "actual": 20,
            "predicted": 22
        }, {
            "date": "2021-03-16",
            "actual": 15,
            "predicted": 15
        }, {
            "date": "2021-03-17",
            "actual": 20,
            "predicted": 19
        }, {
            "date": "2021-03-18",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-19",
            "actual": 25,
            "predicted": 22
        }, {
            "date": "2021-03-20",
            "actual": 18,
            "predicted": 19
        }, {
            "date": "2021-03-21",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-22",
            "actual": 20,
            "predicted": 22
        }, {
            "date": "2021-03-23",
            "actual": 19,
            "predicted": 19
        }, {
            "date": "2021-03-24",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-25",
            "actual": 21,
            "predicted": 22
        }, {
            "date": "2021-03-26",
            "actual": 20,
            "predicted": 19
        }, {
            "date": "2021-03-27",
            "actual": 13,
            "predicted": 15
        }, {
            "date": "2021-03-28",
            "actual": 20,
            "predicted": 22
        }, {
            "date": "2021-03-29",
            "actual": 0,
            "predicted": 19,
            "duration":5,
        }, {
            "date": "2021-03-30",
            "actual": 0,
            "predicted": 15
        }, {
            "date": "2021-03-31",
            "actual": 0,
            "predicted": 22,
            "duration":5,
        }
        ],
        "valueAxes": [{
            "id": "distanceAxis",
            "axisAlpha": 0,
            "gridAlpha": 0,
            "position": "left",
             "title": "Consumption",
        },
            {
                "id": "durationAxis",
                "duration": "mm",
                "durationUnits": {
                    "hh": "h ",
                    "mm": "min"
                },
                 "position": "right",
                 "title": "Watering time",
            }],
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
            "valueField": "actual",
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
            "valueField": "predicted",
            "valueAxis": "distanceAxis"
        }, {
        "bullet": "circle",
        "bulletBorderAlpha": 1,
        "bulletBorderThickness": 1,
        "dashLengthField": "dashLength",
        "legendValueText": "[[value]]",
         "legendPeriodValueText": "total: [[value.sum]] min",
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


    const chart3 = AmCharts.makeChart("chart-weekly-"+i, {
                "type": "serial",
                "hideCredits":true,
                "theme": "none",
                "synchronizeGrid":true,
                "valueAxes": [{
                    "id":"v1",
                    "axisColor": "#007bff",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }],
                "numberFormatter": {
                    "precision": 2,
                    "decimalSeparator": ".",
                    "thousandsSeparator": ","
                },
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#007bff",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "This week",
                    "valueField": "this_week",
                "fillAlphas": 0
                }, {
                    "valueAxis": "v1",
                    "lineColor": "#6c757d",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "Last week",
                    "valueField": "last_week",
                "fillAlphas": 0
                } ],
                "chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "idx",
                "categoryAxis": {
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "menu": []
                 },
                 "dataProvider": [
                     {
                         "last_week":"12",
                         "this_week": "11",
                     },
                     {
                         "last_week":"10",
                         "this_week": "11",
                     },
                 ]
            });

}
