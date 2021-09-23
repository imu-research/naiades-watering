console.log(history);
console.log(prediction_history)
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
        "updateOnReleaseOnly": true
        //"oppositeAxis": true,
        //"offset": 30
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
    "dataProvider": prediction_history,
    /*"dataProvider": [{
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
    ],*/
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
        //"valueField": "actual",
        "valueField": "value_old",
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
        //"valueField": "predicted",
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

const chart3 = AmCharts.makeChart("chart-ec", {
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
        /*"balloon":{
          "drop":true,
          "adjustBorderColor":false,
          "color":"#ffffff"
        },*/
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
        //"dashLength": 1,
        "minorGridEnabled": true,
        "minPeriod": "mm"
    },
    "export": {
        "enabled": true,
        "menu":[],
    },
    "dataProvider": ec_history
});

const chart4 = AmCharts.makeChart("chart-soil-temp", {
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
        /*"balloon":{
          "drop":true,
          "adjustBorderColor":false,
          "color":"#ffffff"
        },*/
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
        //"dashLength": 1,
        "minorGridEnabled": true,
        "minPeriod": "mm"
    },
    "export": {
        "enabled": true,
        "menu":[],
    },
    "dataProvider": soil_temp_history[0],
    /*"dataProvider": [{
        "date": "2020-07-27",
        "value": 13
    }, {
        "date": "2020-07-28",
        "value": 11
    }, {
        "date": "2020-07-29",
        "value": 15
    }],*/
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
                        "text": window.MESSAGES.battery
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
    "dataProvider": battery_history
});

const charts = [];
charts.push(chart);
charts.push(chart2);
charts.push(chart3);
charts.push(chart4);
charts.push(chart5);

for (const x in charts) {
    charts[x].addListener("zoomed", syncZoom);
}

function zoomChart() {
    for (const x in charts) {
        charts[x].zoomToIndexes(charts[x].dataProvider.length - 600, charts[x].dataProvider.length - 1);
    }
}

function syncZoom(event) {
  for (const x in charts) {
    if (charts[x].ignoreZoom) {
      charts[x].ignoreZoom = false;
    }
    if (event.chart !== charts[x]) {
      charts[x].ignoreZoom = true;
      charts[x].zoomToDates(event.startDate, event.endDate);
    }
  }
}

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
}

AmCharts.checkEmptyData(chart);
