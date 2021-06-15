function exportReport(box_data, watering_logs) {

  // So that we know export was started
  console.log("Starting export...");

  // Define IDs of the charts we want to include in the report
  var ids = ["chart-history", "chart-prediction", "chart-ec", "chart-soil-temp", "chart-battery"];
  //var ids = ["chartdiv1", "chartdiv2", "chartdiv3", "chartdiv4"];

  // Collect actual chart objects out of the AmCharts.charts array
  var charts = {}
  var charts_remaining = ids.length;
  for (var i = 0; i < ids.length; i++) {
    for (var x = 0; x < AmCharts.charts.length; x++) {
      // charts[ids[i]] = AmCharts.charts[x];
      if (AmCharts.charts[x].div && AmCharts.charts[x].div.id == ids[i])
        charts[ids[i]] = AmCharts.charts[x];
    }
  }

  // Trigger export of each chart
  for (var x in charts) {
    if (charts.hasOwnProperty(x)) {
      var chart = charts[x];
      chart["export"].capture({}, function() {
        this.toPNG({}, function(data) {

          // Save chart data into chart object itself
          this.setup.chart.exportedImage = data;

          // Reduce the remaining counter
          charts_remaining--;

          // Check if we got all of the charts
          if (charts_remaining === 0) {
            // Yup, we got all of them
            // Let's proceed to putting PDF together
            generatePDF(box_data);
          }

        });
      });
    }
  }

  function getLogEntriesBody(wateringLog) {
      // start with headers
      const logEntries=[
          [
              { text: window.MESSAGES.date2, style: 'tableHeader'},
              { text: window.MESSAGES.waterAmount, style: 'tableHeader' },
              { text: window.MESSAGES.predicted, style: 'tableHeader' }
          ]
      ];

      // add one entry for each log
      $.each(watering_logs, function(idx, log) {
          const logEntry =[log.date];

          // add date, old, & new values
          logEntry.push(log.value_old || '-');
          logEntry.push(log.value_new || '-');

          // add to logs
          logEntries.push(logEntry);
      });

      return logEntries
  }

  function generatePDF(data) {

    // Log
    console.log("Generating PDF...");
    console.log(charts);
    // Initiliaze a PDF layout
    var layout = {
      "content": []
    };

    // Let's add a custom title
    layout.content.push({
      "text": window.MESSAGES.consumptionReport,
      "fontSize": 15,
       "alignment": "center"
    });

    layout.content.push({
            text: 'Box '+box_data.name, fontSize: 14, bold: true, margin: [0, 20, 0, 10], alignment: 'center'
        });

    // Now let's grab actual content from our <p> intro tag
    /*layout.content.push({
      "text": document.getElementById("intro").innerHTML
    }); */

    // Put next charts
    layout.content.push({
        "image": charts["chart-history"].exportedImage,
        "fit": [523, 600]
    });

     layout.content.push({
      "image": charts["chart-prediction"].exportedImage,
      "fit": [523, 600]
    });

    // Put two next charts side by side in columns
    layout.content.push({
      "columns": [{
        "width": "50%",
        "image": charts["chart-ec"].exportedImage,
        "fit": [250, 300]
      }, {
        "width": "*",
        "image": charts["chart-soil-temp"].exportedImage,
        "fit": [250, 300]
      }],
      "columnGap": 10
    });

    layout.content.push({
      "image": charts["chart-battery"].exportedImage,
      "fit": [523, 600]
    });

     layout.content.push({
      text: 'Box Details', fontSize: 14, bold: true, margin: [0, 20, 0, 8]
    });

    layout.content.push({
      table: {
            widths: [120, 120, 120, 120],
            heights: 60,
            body: [
                //[{ text: 'Date', style: 'tableHeader'}, { text: 'Amount of water', style: 'tableHeader' }, { text: 'Comments', style: 'tableHeader' }],
                [window.MESSAGES.boxId+':', data.boxId, window.MESSAGES.soilType2+':', 'Terrau'],
                [window.MESSAGES.flowerType2+':', data.flowerType, window.MESSAGES.sunExposure2+':', data.sunExposure],
                [window.MESSAGES.sensorId+':', data.refDevice, window.MESSAGES.humidity+':', data.soilMoisture]
            ]
        },
      layout: 'noBorders'
    });

    // Let's add a table for watering logs
    layout.content.push({
      text: `${window.MESSAGES.wateringLogs}:`, fontSize: 14, bold: true, margin: [0, 20, 0, 8]
    });

    layout.content.push({
      table: {
        widths: [150, 150, 150],
        body: getLogEntriesBody(watering_logs)
      },
      layout: 'lightHorizontalLines'
    });

    const now = new Date();

    // Trigger the generation and download of the PDF
    // We will use the first chart as a base to execute Export on
    chart["export"].toPDF(layout, function(data) {
      this.download(data, "application/pdf", "Report-"+now+".pdf");
    });
  }
}
