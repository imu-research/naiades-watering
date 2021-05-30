var chart1 = AmCharts.makeChart("chart-prediction-overall", {
        "type": "serial",
        "theme": "light",
        "hideCredits": true,
        "mouseWheelZoomEnabled": true,
        "titles": [
            {
                "id": "Title-1",
                "size": 15,
                "text": "Total Monthly Water Consumption"
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

var chart2 = AmCharts.makeChart("chartdiv", {
  "type": "serial",
     "theme": "none",
  "categoryField": "box",
  "hideCredits": true,
    "titles": [
            {
                "id": "Title-1",
                "size": 15,
                "text": "Last watering vs previous watering"
            }
        ],
  "rotate": true,
  "startDuration": 1,
  "categoryAxis": {
    "gridPosition": "start",
    "position": "left"
  },
  "trendLines": [],
  "graphs": [
    {
      "balloonText": "This watering:[[value]]",
      "fillAlphas": 0.8,
      "id": "AmGraph-1",
      "lineAlpha": 0.2,
      "title": "This watering",
      "type": "column",
      "valueField": "this_watering"
    },
    {
      "balloonText": "Previous watering:[[value]]",
      "fillAlphas": 0.8,
      "id": "AmGraph-2",
      "lineAlpha": 0.2,
      "title": "Previous watering",
      "type": "column",
      "valueField": "last_watering"
    }
  ],
  "guides": [],
  "valueAxes": [
    {
      "id": "ValueAxis-1",
      "position": "top",
      "axisAlpha": 0
    }
  ],
  "allLabels": [],
  "balloon": {},
  //"titles": [],
  "dataProvider": graph_data,
    /*[
    {
      "box": "Box 1",
      "income": 23.5,
      "expenses": 18.1
    },
    {
      "box": "Box 2",
      "income": 26.2,
      "expenses": 22.8
    },
    {
      "box": "Box 3",
      "income": 30.1,
      "expenses": 23.9
    },
    {
      "box": "Box 4",
      "income": 29.5,
      "expenses": 25.1
    },
    {
      "box": "Box 5",
      "income": 24.6,
      "expenses": 25
    }
  ],*/
    "export": {
    	"enabled": true,
        "menu":[]
     }

});