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
                "text": "Periodic Water Consumption (Cluster)"
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

    var chart3 = AmCharts.makeChart("chart-consumption-box-"+i, {
        "type": "serial",
        "theme": "light",
        "hideCredits": true,
        "mouseWheelZoomEnabled": true,
        "titles": [
            {
                "id": "Title-1",
                "size": 15,
                "text": "Periodic Water Consumption (Avg. per Box)"
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


}


const chart4 = AmCharts.makeChart("chart-km", {
                "type": "serial",
                "theme": "none",
                //"marginRight": 40,
                "marginLeft": 40,
                //"autoMarginOffset": 20,
                "hideCredits": true,
                "mouseWheelZoomEnabled": true,
                "titles": [
                    {
                        "id": "Title-1",
                        "size": 15,
                        "text": "Number of km"
                    }
                ],
                "dataDateFormat": "YYYY-MM-DD",
                "valueAxes": [{
                    "id": "v1",
                    "axisAlpha": 0,
                    "position": "left",
                    "ignoreAxisWidth":true
                }],
                "balloon": {
                    "borderThickness": 1,
                    "shadowAlpha": 0
                },
                "graphs": [{
                    "id": "g1",
                    "balloon":{
                      "drop":true,
                      "adjustBorderColor":false,
                      "color":"#ffffff"
                    },
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor": "#FFFFFF",
                    "bulletSize": 5,
                    "hideBulletsCount": 50,
                    "lineThickness": 2,
                    "title": "red line",
                    "useLineColorForBulletBorder": true,
                    "valueField": "value",
                    "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
                }],
                /*"chartScrollbar": {
                    "graph": "g1",
                    "oppositeAxis":false,
                    "offset":30,
                    "scrollbarHeight": 80,
                    "backgroundAlpha": 0,
                    "selectedBackgroundAlpha": 0.1,
                    "selectedBackgroundColor": "#888888",
                    "graphFillAlpha": 0,
                    "graphLineAlpha": 0.5,
                    "selectedGraphFillAlpha": 0,
                    "selectedGraphLineAlpha": 1,
                    "autoGridCount":true,
                    "color":"#AAAAAA"
                },*/
                "chartCursor": {
                    //"pan": true,
                    "valueLineEnabled": true,
                    "valueLineBalloonEnabled": true,
                    "cursorAlpha":1,
                    "cursorColor":"#258cbb",
                    "limitToGraph":"g1",
                    "valueLineAlpha":0.2,
                    //"valueZoomable":true
                },
                /*"valueScrollbar":{
                  "oppositeAxis":false,
                  "offset":50,
                  "scrollbarHeight":10
                },*/
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "dashLength": 1,
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "menu": []
                },
                "dataProvider": [
                    {
                    "date": "2021-03-01",
                    "value": 20,
                }, {
                    "date": "2021-03-02",
                    "value": 18,
                }, {
                    "date": "2021-03-03",
                    "value": 12,
                }, {
                    "date": "2021-03-04",
                    "value": 24,
                }, {
                    "date": "2021-03-05",
                    "value": 18,
                }, {
                    "date": "2021-03-06",
                    "value": 12,
                }, {
                    "date": "2021-03-07",
                    "value": 20,
                }, {
                    "date": "2021-03-08",
                    "value": 13,
                }, {
                    "date": "2021-03-09",
                    "value": 19,
                }, {
                    "date": "2021-03-10",
                    "value": 20,

                }, {
                    "date": "2021-03-11",
                    "value": 13,
                }, {
                    "date": "2021-03-12",
                    "value": 18,
                }, {
                    "date": "2021-03-13",
                    "value": 23,
                }, {
                    "date": "2021-03-14",
                    "value": 13,
                }, {
                    "date": "2021-03-15",
                    "value": 20,
                }, {
                    "date": "2021-03-16",
                    "value": 15,
                }, {
                    "date": "2021-03-17",
                    "value": 20,
                }, {
                    "date": "2021-03-18",
                    "value": 13,
                }, {
                    "date": "2021-03-19",
                    "value": 25,
                }, {
                    "date": "2021-03-20",
                    "value": 18
                }, {
                    "date": "2021-03-21",
                    "value": 13,
                }, {
                    "date": "2021-03-22",
                    "value": 20,
                }, {
                    "date": "2021-03-23",
                    "value": 19,
                }, {
                    "date": "2021-03-24",
                    "value": 13,

                }, {
                    "date": "2021-03-25",
                    "value": 21,
                }, {
                    "date": "2021-03-26",
                    "value": 20,
                }, {
                    "date": "2021-03-27",
                    "value": 13,
                }, {
                    "date": "2021-03-28",
                    "value": 20,
                }, {
                    "date": "2021-03-29",
                    "value": 0,
                }, {
                    "date": "2021-03-30",
                    "value": 0,
                }, {
                    "date": "2021-03-31",
                    "value": 0,
                }
                ]
                });

var chart6 = AmCharts.makeChart("chart-prediction-overall", {
        "type": "serial",
        "theme": "light",
        "hideCredits": true,
        "mouseWheelZoomEnabled": true,
        "titles": [
            {
                "id": "Title-1",
                "size": 15,
                "text": "Total Periodic Water Consumption"
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
