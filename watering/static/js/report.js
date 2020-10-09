function exportReport(box_data) {

  // So that we know export was started
  console.log("Starting export...");

  // Define IDs of the charts we want to include in the report
  var ids = ["chart-history", "chart-prediction"];
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
          if (charts_remaining == 0) {
            // Yup, we got all of them
            // Let's proceed to putting PDF together
            generatePDF(box_data);
          }

        });
      });
    }
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
      "text": "Water Consumption Report",
      "fontSize": 15,
       "alignment": "center"
    });

    // Now let's grab actual content from our <p> intro tag
    /*layout.content.push({
      "text": document.getElementById("intro").innerHTML
    }); */

    // Put two next charts side by side in columns
    layout.content.push({
        "image": charts["chart-history"].exportedImage,
        "fit": [523, 300]
    });

     layout.content.push({
      "image": charts["chart-prediction"].exportedImage,
      "fit": [523, 300]
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
					['Box ID:', data.boxId, 'Type of soil:', 'Terrau'],
                    ['Type of flowers:', data.flowerType, 'Exposure to sun:', data.sunExposure],
                    ['Sensor ID:', data.refDevice, 'Humidity', data.soilMoisture]
				]
			},
      layout: 'noBorders'
    });

    // Let's add table

    layout.content.push({
      text: 'Watering Logs:', fontSize: 14, bold: true, margin: [0, 20, 0, 8]
    });

    layout.content.push({
      table: {
				//headerRows: 1,
				// dontBreakRows: true,
				// keepWithHeaderRows: 1,
                widths: [150, 150, 150],
				body: [
					[{ text: 'Date', style: 'tableHeader'}, { text: 'Amount of water', style: 'tableHeader' }, { text: 'Comments', style: 'tableHeader' }],
					['20/10/2020', '0.5 lt', 'Comments'],
                    ['23/10/2020', '0.5 lt', 'Comments'],
                    ['25/10/2020', '0.5 lt', 'Comments']
				]
			},
      layout: 'lightHorizontalLines'
    });


    // Add chart and text next to each other
    /*layout.content.push({
      "columns": [{
        "width": "25%",
        "image": charts["chartdiv4"].exportedImage,
        "fit": [125, 300]
      }, {
        "width": "*",
        "stack": [
          document.getElementById("note1").innerHTML,
          "\n\n",
          document.getElementById("note2").innerHTML
        ]
      }],
      "columnGap": 10
    });*/
    var now = new Date();

    // Trigger the generation and download of the PDF
    // We will use the first chart as a base to execute Export on
    chart["export"].toPDF(layout, function(data) {
      this.download(data, "application/pdf", "Report-"+now+".pdf");
    });


  }

}