function exportDailyReport(box_data, consumption, time) {

  // So that we know export was started
  console.log("Starting export...");

  // Define IDs of the charts we want to include in the report
  var ids = ["chartdiv"];

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
          if (charts_remaining == 0) {
            // Yup, we got all of them
            // Let's proceed to putting PDF together
            generatePDF(box_data);
          }

        });
      });
    }
  }

  function getEntriesBody(box_data) {
      // start with headers
      const logEntries=[
          [
              {text: window.MESSAGES.boxId, style: 'tableHeader'},
              {text: window.MESSAGES.humidityLevel, style: 'tableHeader'},
              {text: window.MESSAGES.amountOfWatering, style: 'tableHeader'},
              {text: window.MESSAGES.timeOfWatering, style: 'tableHeader'},
              {text: window.MESSAGES.nextAmount, style: 'tableHeader'},
          ]
      ];

      // add one entry for each log
      $.each(box_data, function(idx, log) {
          if(log.lastWatering == "TODAY"){
              const logEntry =[log.boxId];

              // add date, old, & new values
              logEntry.push(log.soilMoisture+' '+log.moistureUnit || '-');
              logEntry.push(log.consumption || '-');
              logEntry.push(log.duration || '-');
              logEntry.push(log.nextWateringAmountAdvice || '-');

              // add to logs
              logEntries.push(logEntry);

          }

          if(logEntries.length == 1){
              logEntries.push(['-', '-', '-', '-', '-']);
          }
      });

      return logEntries
  }

  //generatePDF(box_data);

  function generatePDF(data) {

    // Log
    console.log("Generating PDF...");
    // Initiliaze a PDF layout
    var layout = {
      "content": []
    };

    // Let's add a custom title
    layout.content.push({
      //"text": window.MESSAGES.consumptionReport,
      "text": "Today's Report",
      "fontSize": 15,
        "alignment": "center",
        "bold": true
    });

     layout.content.push({
      "text": "Overall",
      "fontSize": 11,
      "margin": [0, 20, 0, 10],
      "alignment": "center",
      "bold":true
    });

    layout.content.push({
            table: {
                widths: [300, 300],
                heights: 200,
                alignment: 'center',
                body: [
                    [{
                        text: 'Todays Water Consumption',
                        style: 'tableHeader'
                    }, {text: 'Todays Watering Time', style: 'tableHeader'}],
                    [consumption+' lt', time+' s']
                ]
            },
            layout: 'noBorders'
        });

        // Let's add table

        layout.content.push({
            text: 'Watered Today', fontSize: 14, bold: true, margin: [0, 20, 0, 8]
        });

        //Create

        layout.content.push({
            table: {
                //headerRows: 1,
                // dontBreakRows: true,
                // keepWithHeaderRows: 1,
                widths: [75, 85, 85, 85, 85, 85],
                body: getEntriesBody(box_data)
            },
            layout: 'lightHorizontalLines'
        });

     // Put overall chart
        layout.content.push({
            "image": charts["chartdiv"].exportedImage,
            "fit": [523, 600]
        });

    var now = new Date();

    // Trigger the generation and download of the PDF
    // We will use the first chart as a base to execute Export on
    chart["export"].toPDF(layout, function(data) {
      this.download(data, "application/pdf", "DailyReport-"+now+".pdf");
    });


  }

}