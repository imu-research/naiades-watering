console.log(history);
var chart = AmCharts.makeChart("chart-history", {
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
    //"mouseWheelZoomEnabled":true,
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
        //"axisAlpha": 0,
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
        //"axisAlpha": 0,
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
    /*"graphs": [{
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
        "balloonText": "<span style='font-size:18px;'>[[value]]</span>",
        "fillAlphas": 0.3,
        "fillColorsField": "#ffffff",
    }],*/
    "chartScrollbar": {
        "enable":true,
    },
    "chartCursor": {
        "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
        "cursorPosition": "mouse",
        //"valueLineEnabled": true,
        //"valueLineBalloonEnabled": true,
        //"cursorAlpha":1,
        //"cursorColor":"#258cbb",
        //"limitToGraph":"g1",
        //"valueLineAlpha":0.2,
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
        //"dashLength": 1,
        "minorGridEnabled": true,
        "minPeriod": "mm",
        "axisColor": "#DADADA",
    },
    "export": {
        "enabled": true,
        "menu":[],
    },
    "dataProvider": history
});

var chart2 = AmCharts.makeChart("chart-prediction", {
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
    "dataProvider": [{
        "date": "2021-03-01",
        "actual": 20,
        "predicted": 22
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
    },{
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
    },{
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
    },{
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
    },{
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
    },{
        "date": "2021-03-29",
        "actual": 0,
        "predicted": 19
    }, {
        "date": "2021-03-30",
        "actual": 0,
        "predicted": 15
    }, {
        "date": "2021-03-31",
        "actual": 0,
        "predicted": 22
    }
    ],
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
        //"legendPeriodValueText": "total: [[value.sum]] lt",
        "legendValueText": "[[value]] lt",
        "title": window.MESSAGES.actual,
        "type": "column",
        "valueField": "actual",
        "valueAxis": "distanceAxis"
    }, {
        /*"bullet": "square",
        "bulletBorderAlpha": 1,
        "bulletBorderThickness": 1,*/
        "alphaField": "alpha",
        "balloonText": "[[value]] lt",
        "type": "column",
        "dashLengthField": "dashLength",
        "legendValueText": "[[value]] lt",
        "title": window.MESSAGES.predicted,
        //"fillAlphas": 0,
        "fillAlphas": 0.6,
        "valueField": "predicted",
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
    "chartScrollbar": {
        "enable":true,
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

const chart3 = AmCharts.makeChart("chart-ec", {
    "type": "serial",
    "hideCredits":true,
    "theme": "none",
    "marginRight": 40,
    "marginLeft": 60,
    "autoMarginOffset": 20,
    "mouseWheelZoomEnabled":true,
    "dataDateFormat": "YYYY-MM-DD",
    "titles": [
                    {
                        "id": "Title-1",
                        "size": 15,
                        "text": "Soil Electroconductivity (EC)"
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
        "balloonText": "<span style='font-size:18px;'>[[value]] "+"S/m"+"</span>"
    }],
    "chartScrollbar": {
        "enable":true,
    },
    "categoryField": "date",
    "categoryAxis": {
        "parseDates": true,
        "dashLength": 1,
        "minorGridEnabled": true
    },
    "export": {
        "enabled": true,
        "menu":[],
    },
    "dataProvider": [{
        "date": "2020-07-27",
        "value": 13
    }, {
        "date": "2020-07-28",
        "value": 11
    }, {
        "date": "2020-07-29",
        "value": 15
    }, {
        "date": "2020-07-30",
        "value": 16
    }, {
        "date": "2020-07-31",
        "value": 18
    }],
});

const chart4 = AmCharts.makeChart("chart-soil-temp", {
    "type": "serial",
    "hideCredits":true,
    "theme": "light",
    "marginRight": 40,
    "marginLeft": 60,
    "autoMarginOffset": 20,
    "mouseWheelZoomEnabled":true,
    "dataDateFormat": "YYYY-MM-DD",
    "titles": [
                    {
                        "id": "Title-1",
                        "size": 15,
                        "text": "Soil Temperature"
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
        "balloonText": "<span style='font-size:18px;'>[[value]]"+"°C"+"</span>"
    }],
    "chartScrollbar": {
        "enable":true,
    },
    "categoryField": "date",
    "categoryAxis": {
        "parseDates": true,
        "dashLength": 1,
        "minorGridEnabled": true
    },
    "export": {
        "enabled": true,
        "menu":[],
    },
    "dataProvider": [{
        "date": "2020-07-27",
        "value": 13
    }, {
        "date": "2020-07-28",
        "value": 11
    }, {
        "date": "2020-07-29",
        "value": 15
    }, {
        "date": "2020-07-30",
        "value": 16
    }, {
        "date": "2020-07-31",
        "value": 18
    }],
});

const chart5 = AmCharts.makeChart("chart-battery", {
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
    //"mouseWheelZoomEnabled":true,
    "dataDateFormat": "YYYY-MM-DD"+'T'+"JJ:NN:SS.QQQ",
    "titles": [
                    {
                        "id": "Title-1",
                        "size": 15,
                        "text": "Battery"
                    }
                ],
    "valueAxes": [{
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "title": "Battery (%)",
    }
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
        "legendValueText": "[[value]] %",
        "balloonText": "[[value]] %",
        "lineThickness": 1.5,
    "fillAlphas": 0
    }],
    "chartScrollbar": {
        "enable":true,
    },
    "chartCursor": {
        "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
        "cursorPosition": "mouse",
        //"valueLineEnabled": true,
        //"valueLineBalloonEnabled": true,
        //"cursorAlpha":1,
        //"cursorColor":"#258cbb",
        //"limitToGraph":"g1",
        //"valueLineAlpha":0.2,
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
        //"dashLength": 1,
        "minorGridEnabled": true,
        "minPeriod": "mm",
        "axisColor": "#DADADA",
    },
    "export": {
        "enabled": true,
        "menu":[],
    },
    "dataProvider": history
});

chart.addListener("rendered", zoomChart);
chart2.addListener("rendered", zoomChart);
chart5.addListener("rendered", zoomChart);

zoomChart();


function zoomChart() {
    chart.zoomToIndexes(chart.dataProvider.length - 60, chart.dataProvider.length - 1);
    chart5.zoomToIndexes(chart.dataProvider.length - 60, chart.dataProvider.length - 1);
}

AmCharts.checkEmptyData = function (chart) {
    if ( 0 == chart.dataProvider.length ) {
        // set min/max on the value axis
        chart.valueAxes[0].minimum = 0;
        chart.valueAxes[0].maximum = 100;

        // add dummy data point
        var dataPoint = {
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
}

AmCharts.checkEmptyData(chart);

var data = [{
        "date": "2020-07-27",
        "value": 13
    }, {
        "date": "2020-07-28",
        "value": 11
    }, {
        "date": "2020-07-29",
        "value": 15
    }, {
        "date": "2020-07-30",
        "value": 16
    }, {
        "date": "2020-07-31",
        "value": 18
    }, {
        "date": "2020-08-01",
        "value": 13
    }, {
        "date": "2020-08-02",
        "value": 22
    }, {
        "date": "2020-08-03",
        "value": 23
    }, {
        "date": "2020-08-04",
        "value": 20
    }, {
        "date": "2020-08-05",
        "value": 17
    }, {
        "date": "2020-08-06",
        "value": 16
    }, {
        "date": "2020-08-07",
        "value": 18
    }, {
        "date": "2020-08-08",
        "value": 21
    }, {
        "date": "2020-08-09",
        "value": 26
    }, {
        "date": "2020-08-10",
        "value": 24
    }, {
        "date": "2020-08-11",
        "value": 29
    }, {
        "date": "2020-08-12",
        "value": 32
    }, {
        "date": "2020-08-13",
        "value": 18
    }, {
        "date": "2020-08-14",
        "value": 24
    }, {
        "date": "2020-08-15",
        "value": 22
    }, {
        "date": "2020-08-16",
        "value": 18
    }, {
        "date": "2020-08-17",
        "value": 19
    }, {
        "date": "2020-08-18",
        "value": 14
    }, {
        "date": "2020-08-19",
        "value": 15
    }, {
        "date": "2020-08-20",
        "value": 12
    }, {
        "date": "2020-08-21",
        "value": 8
    }, {
        "date": "2020-08-22",
        "value": 9
    }, {
        "date": "2020-08-23",
        "value": 8
    }, {
        "date": "2020-08-24",
        "value": 7
    }, {
        "date": "2020-08-25",
        "value": 5
    }, {
        "date": "2020-08-26",
        "value": 11
    }, {
        "date": "2020-08-27",
        "value": 13
    }, {
        "date": "2020-08-28",
        "value": 18
    }, {
        "date": "2020-08-29",
        "value": 20
    }, {
        "date": "2020-08-30",
        "value": 29
    }, {
        "date": "2020-08-31",
        "value": 33
    }, {
        "date": "2020-09-01",
        "value": 42
    }, {
        "date": "2020-09-02",
        "value": 35
    }, {
        "date": "2020-09-03",
        "value": 31
    }, {
        "date": "2020-09-04",
        "value": 47
    }, {
        "date": "2020-09-05",
        "value": 52
    }, {
        "date": "2020-09-06",
        "value": 46
    }, {
        "date": "2020-09-07",
        "value": 41
    }, {
        "date": "2020-09-08",
        "value": 43
    }, {
        "date": "2020-09-09",
        "value": 40
    }, {
        "date": "2020-09-10",
        "value": 39
    }, {
        "date": "2020-09-11",
        "value": 34
    }, {
        "date": "2020-09-12",
        "value": 29
    }, {
        "date": "2020-09-13",
        "value": 34
    }, {
        "date": "2020-09-14",
        "value": 37
    }, {
        "date": "2020-09-15",
        "value": 42
    }, {
        "date": "2020-09-16",
        "value": 49
    }, {
        "date": "2020-09-17",
        "value": 46
    }, {
        "date": "2020-09-18",
        "value": 47
    }, {
        "date": "2020-09-19",
        "value": 55
    }, {
        "date": "2020-09-20",
        "value": 59
    }, {
        "date": "2020-09-21",
        "value": 58
    }, {
        "date": "2020-09-22",
        "value": 57
    }, {
        "date": "2020-09-23",
        "value": 61
    }, {
        "date": "2020-09-24",
        "value": 59
    }, {
        "date": "2020-09-25",
        "value": 67
    }, {
        "date": "2020-09-26",
        "value": 65
    }, {
        "date": "2020-09-27",
        "value": 61
    }, {
        "date": "2020-09-28",
        "value": 66
    }, {
        "date": "2020-09-29",
        "value": 69
    }, {
        "date": "2020-09-30",
        "value": 71
    }, {
        "date": "2020-10-01",
        "value": 67
    }, {
        "date": "2020-10-02",
        "value": 63
    }, {
        "date": "2020-10-03",
        "value": 46
    }, {
        "date": "2020-10-04",
        "value": 32
    }, {
        "date": "2020-10-05",
        "value": 21
    }, {
        "date": "2020-10-06",
        "value": 18
    }, {
        "date": "2020-10-07",
        "value": 21
    }, {
        "date": "2020-10-08",
        "value": 28
    }, {
        "date": "2020-10-09",
        "value": 27
    }, {
        "date": "2020-10-10",
        "value": 36
    }, {
        "date": "2020-10-11",
        "value": 33
    }, {
        "date": "2020-10-12",
        "value": 31
    }, {
        "date": "2020-10-13",
        "value": 30
    }, {
        "date": "2020-10-14",
        "value": 34
    }, {
        "date": "2020-10-15",
        "value": 38
    }, {
        "date": "2020-10-16",
        "value": 37
    }, {
        "date": "2020-10-17",
        "value": 44
    }, {
        "date": "2020-10-18",
        "value": 49
    }, {
        "date": "2020-10-19",
        "value": 53
    }, {
        "date": "2020-10-20",
        "value": 57
    }, {
        "date": "2020-10-21",
        "value": 60
    }, {
        "date": "2020-10-22",
        "value": 61
    }, {
        "date": "2020-10-23",
        "value": 69
    }, {
        "date": "2020-10-24",
        "value": 67
    }, {
        "date": "2020-10-25",
        "value": 72
    }, {
        "date": "2020-10-26",
        "value": 77
    }, {
        "date": "2020-10-27",
        "value": 75
    }, {
        "date": "2020-10-28",
        "value": 70
    }, {
        "date": "2020-10-29",
        "value": 72
    }, {
        "date": "2020-10-30",
        "value": 70
    }, {
        "date": "2020-10-31",
        "value": 72
    }, {
        "date": "2020-11-01",
        "value": 73
    }, {
        "date": "2020-11-02",
        "value": 67
    }, {
        "date": "2020-11-03",
        "value": 68
    }, {
        "date": "2020-11-04",
        "value": 65
    }, {
        "date": "2020-11-05",
        "value": 71
    }, {
        "date": "2020-11-06",
        "value": 75
    }, {
        "date": "2020-11-07",
        "value": 74
    }, {
        "date": "2020-11-08",
        "value": 71
    }, {
        "date": "2020-11-09",
        "value": 76
    }, {
        "date": "2020-11-10",
        "value": 77
    }, {
        "date": "2020-11-11",
        "value": 81
    }, {
        "date": "2020-11-12",
        "value": 83
    }, {
        "date": "2020-11-13",
        "value": 80
    }, {
        "date": "2020-11-14",
        "value": 81
    }, {
        "date": "2020-11-15",
        "value": 87
    }, {
        "date": "2020-11-16",
        "value": 82
    }, {
        "date": "2020-11-17",
        "value": 86
    }, {
        "date": "2020-11-18",
        "value": 80
    }, {
        "date": "2020-11-19",
        "value": 87
    }, {
        "date": "2020-11-20",
        "value": 83
    }, {
        "date": "2020-11-21",
        "value": 85
    }, {
        "date": "2020-11-22",
        "value": 84
    }, {
        "date": "2020-11-23",
        "value": 82
    }, {
        "date": "2020-11-24",
        "value": 73
    }, {
        "date": "2020-11-25",
        "value": 71
    }, {
        "date": "2020-11-26",
        "value": 75
    }, {
        "date": "2020-11-27",
        "value": 79
    }, {
        "date": "2020-11-28",
        "value": 70
    }, {
        "date": "2020-11-29",
        "value": 73
    }, {
        "date": "2020-11-30",
        "value": 61
    }, {
        "date": "2020-12-01",
        "value": 62
    }, {
        "date": "2020-12-02",
        "value": 66
    }, {
        "date": "2020-12-03",
        "value": 65
    }, {
        "date": "2020-12-04",
        "value": 73
    }, {
        "date": "2020-12-05",
        "value": 79
    }, {
        "date": "2020-12-06",
        "value": 78
    }, {
        "date": "2020-12-07",
        "value": 78
    }, {
        "date": "2020-12-08",
        "value": 78
    }, {
        "date": "2020-12-09",
        "value": 74
    }, {
        "date": "2020-12-10",
        "value": 73
    }, {
        "date": "2020-12-11",
        "value": 75
    }, {
        "date": "2020-12-12",
        "value": 70
    }, {
        "date": "2020-12-13",
        "value": 77
    }, {
        "date": "2020-12-14",
        "value": 67
    }, {
        "date": "2020-12-15",
        "value": 62
    }, {
        "date": "2020-12-16",
        "value": 64
    }, {
        "date": "2020-12-17",
        "value": 61
    }, {
        "date": "2020-12-18",
        "value": 59
    }, {
        "date": "2020-12-19",
        "value": 53
    }, {
        "date": "2020-12-20",
        "value": 54
    }, {
        "date": "2020-12-21",
        "value": 56
    }, {
        "date": "2020-12-22",
        "value": 59
    }, {
        "date": "2020-12-23",
        "value": 58
    }, {
        "date": "2020-12-24",
        "value": 55
    }, {
        "date": "2020-12-25",
        "value": 52
    }, {
        "date": "2020-12-26",
        "value": 54
    }, {
        "date": "2020-12-27",
        "value": 50
    }, {
        "date": "2020-12-28",
        "value": 50
    }, {
        "date": "2020-12-29",
        "value": 51
    }, {
        "date": "2020-12-30",
        "value": 52
    }, {
        "date": "2020-12-31",
        "value": 58
    }, {
        "date": "2021-01-01",
        "value": 60
    }, {
        "date": "2021-01-02",
        "value": 67
    }, {
        "date": "2021-01-03",
        "value": 64
    }, {
        "date": "2021-01-04",
        "value": 66
    }, {
        "date": "2021-01-05",
        "value": 60
    }, {
        "date": "2021-01-06",
        "value": 63
    }, {
        "date": "2021-01-07",
        "value": 61
    }, {
        "date": "2021-01-08",
        "value": 60
    }, {
        "date": "2021-01-09",
        "value": 65
    }, {
        "date": "2021-01-10",
        "value": 75
    }, {
        "date": "2021-01-11",
        "value": 77
    }, {
        "date": "2021-01-12",
        "value": 78
    }, {
        "date": "2021-01-13",
        "value": 70
    }, {
        "date": "2021-01-14",
        "value": 70
    }, {
        "date": "2021-01-15",
        "value": 73
    }, {
        "date": "2021-01-16",
        "value": 71
    }, {
        "date": "2021-01-17",
        "value": 74
    }, {
        "date": "2021-01-18",
        "value": 78
    }, {
        "date": "2021-01-19",
        "value": 85
    }, {
        "date": "2021-01-20",
        "value": 82
    }, {
        "date": "2021-01-21",
        "value": 83
    }, {
        "date": "2021-01-22",
        "value": 88
    }, {
        "date": "2021-01-23",
        "value": 85
    }, {
        "date": "2021-01-24",
        "value": 85
    }, {
        "date": "2021-01-25",
        "value": 80
    }, {
        "date": "2021-01-26",
        "value": 87
    }, {
        "date": "2021-01-27",
        "value": 84
    }, {
        "date": "2021-01-28",
        "value": 83
    }, {
        "date": "2021-01-29",
        "value": 84
    }, {
        "date": "2021-01-30",
        "value": 81
    },
        {
        "date": "2021-02-01",
        "value": 60
    }, {
        "date": "2021-02-02",
        "value": 67
    }, {
        "date": "2021-02-03",
        "value": 64
    }, {
        "date": "2021-02-04",
        "value": 66
    }, {
        "date": "2021-02-05",
        "value": 60
    }, {
        "date": "2021-02-06",
        "value": 63
    }, {
        "date": "2021-02-07",
        "value": 61
    }, {
        "date": "2021-02-08",
        "value": 60
    }, {
        "date": "2021-02-09",
        "value": 65
    }, {
        "date": "2021-02-10",
        "value": 75
    }, {
        "date": "2021-02-11",
        "value": 77
    }, {
        "date": "2021-02-12",
        "value": 78
    }, {
        "date": "2021-02-13",
        "value": 70
    }, {
        "date": "2021-02-14",
        "value": 70
    }, {
        "date": "2021-02-15",
        "value": 73
    }, {
        "date": "2021-02-16",
        "value": 71
    }, {
        "date": "2021-02-17",
        "value": 74
    }, {
        "date": "2021-02-18",
        "value": 78
    }, {
        "date": "2021-02-19",
        "value": 85
    }, {
        "date": "2021-02-20",
        "value": 82
    }, {
        "date": "2021-02-21",
        "value": 83
    }, {
        "date": "2021-02-22",
        "value": 88
    }, {
        "date": "2021-02-23",
        "value": 85
    }, {
        "date": "2021-02-24",
        "value": 85
    }, {
        "date": "2021-02-25",
        "value": 80
    }, {
        "date": "2021-02-26",
        "value": 87
    }, {
        "date": "2021-02-27",
        "value": 84
    }, {
        "date": "2021-02-28",
        "value": 83
    },
        {
        "date": "2021-03-01",
        "value": 60
    }, {
        "date": "2021-03-02",
        "value": 67
    }, {
        "date": "2021-03-03",
        "value": 64
    }, {
        "date": "2021-03-04",
        "value": 66
    }, {
        "date": "2021-03-05",
        "value": 60
    }, {
        "date": "2021-03-06",
        "value": 63
    }, {
        "date": "2021-03-07",
        "value": 61
    }, {
        "date": "2021-03-08",
        "value": 60
    }, {
        "date": "2021-03-09",
        "value": 65
    }, {
        "date": "2021-03-10",
        "value": 75
    }, {
        "date": "2021-03-11",
        "value": 77
    }, {
        "date": "2021-03-12",
        "value": 78
    }, {
        "date": "2021-03-13",
        "value": 70
    }, {
        "date": "2021-03-14",
        "value": 70
    }, {
        "date": "2021-03-15",
        "value": 73
    }, {
        "date": "2021-03-16",
        "value": 71
    }, {
        "date": "2021-03-17",
        "value": 74
    }, {
        "date": "2021-03-18",
        "value": 78
    }];