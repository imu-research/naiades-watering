function exportMonthlyReport(box_data) {

  // So that we know export was started
  console.log("Starting export...");

  // Define IDs of the charts we want to include in the report
  var ids = [ "chart-data-overall", "chart-km", "chart-data-1", "chart-data-2", "chart-data-3", "chart-data-4", "chart-data-5", "chart-data-6",  "chart-data-7", "chart-data-8", "chart-data-9",  "chart-data-10", "chart-data-11", "chart-data-per-box-1", "chart-data-per-box-2", "chart-data-per-box-3", "chart-data-per-box-4", "chart-data-per-box-5", "chart-data-per-box-6", "chart-data-per-box-7", "chart-data-per-box-8", "chart-data-per-box-9", "chart-data-per-box-10", "chart-data-per-box-11" ];
  //"chart-km"
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
            generatePDF();
          }

        });
      });
    }
  }

  function getEntriesBody(boxId) {
      // start with headers
      const logEntries = [
          [
              {text: window.MESSAGES.issue, style: 'tableHeader'},
              {text: window.MESSAGES.description, style: 'tableHeader'},
              {text: window.MESSAGES.user, style: 'tableHeader'},
              {text: window.MESSAGES.date2, style: 'tableHeader'},
          ]
      ];

      $.each($(`#watering-issues-table-${boxId} tbody tr:not(.empty)`), function(idx, row) {
          const $row = $(row);

          // add to entries
          logEntries.push([
              $row.find("td:nth-of-type(1)").text(),
              $row.find("td:nth-of-type(2)").text(),
              $row.find("td:nth-of-type(3)").text(),
              $row.find("td:nth-of-type(4)").text(),

          ]);
      });

      // add placeholder row if empty
      if (logEntries.length === 1) {
          logEntries.push(['-', '-', '-', '-']);
      }

      return logEntries
  }

  function generatePDF() {

    // Log
    console.log("Generating PDF...");
    console.log(charts);
    // Initiliaze a PDF layout
    var layout = {
      "content": []
    };

    // Let's add a custom title
    layout.content.push({
      //"text": window.MESSAGES.consumptionReport,
      "text": `Periodic Report: ${$("#reportrange span").text()}`,
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
                [
                    {
                        text: 'Total Monthly Water Consumption',
                        style: 'tableHeader'
                    },
                    {
                        text: 'Total Monthly Watering Time',
                        style: 'tableHeader'
                    },
                ],
                [
                    $("#overall-values > .metric:nth-of-type(1) .recommended-value").text(),
                    $("#overall-values > .metric:nth-of-type(2) .recommended-value").text()
                ]
            ]
        },
        layout: 'noBorders',
    });
    layout.content.push({
        table: {
            widths: [600],
            heights: 200,
            alignment: 'center',
            body: [
                [
                    {
                        text: 'Total Time Spent',
                        style: 'tableHeader'
                    }
                ],
                [
                    $("#overall-values > .metric:nth-of-type(3) .recommended-value").text()
                ]
            ]
        },
        layout: 'noBorders',
    });

    // Put overall chart
    layout.content.push({
        "image": charts["chart-data-overall"].exportedImage,
        "fit": [523, 600]
    });
    layout.content.push({
        "image": charts["chart-km"].exportedImage,
        "fit": [523, 600],
        pageBreak: 'after'
    });

    //for (var i = 1; i < 9; i++) {
    for (var box in box_data)  {
        const boxId = box_data[box].boxId;

        layout.content.push({
            text: 'Cluster '+box_data[box].name+' Monthly Report', fontSize: 14, bold: true, margin: [0, 20, 0, 10], alignment: 'center'
        });

        layout.content.push({
            table: {
                widths: [250, 250],
                heights: 200,
                alignment: 'center',
                margin: [5, 0, 5, 10],
                body: [
                    [
                        {
                            text: 'Total Monthly Water Consumption (Cluster)',
                            style: 'tableHeader'
                        },
                        {
                            text: 'Total Monthly Water Consumption (Avg. per Box)',
                            style: 'tableHeader'
                        },
                    ],
                    [
                        $(`#box-container-${boxId} > .row:nth-of-type(2) > .metric:nth-of-type(1) .recommended-value`).text(),
                        $(`#box-container-${boxId} > .row:nth-of-type(2) > .metric:nth-of-type(2) .recommended-value`).text()
                    ]
                ]
            },
            layout: 'noBorders'
        });
        layout.content.push({
            table: {
                widths: [250, 250 ],
                heights: 200,
                alignment: 'center',
                margin: [5, 0, 5, 10],
                body: [
                    [

                        {
                            text: 'Total Time Spent (Cluster)',
                            style: 'tableHeader'
                        },
                        {
                            text: 'Total Time Spent (Avg. per Box)',
                            style: 'tableHeader'
                        }
                    ],
                    [

                        $(`#box-container-${boxId} > .row:nth-of-type(2) > .metric:nth-of-type(3) .recommended-value`).text(),
                        $(`#box-container-${boxId} > .row:nth-of-type(2) > .metric:nth-of-type(4) .recommended-value`).text()
                    ]
                ]
            },
            layout: 'noBorders'
        });

        // Put overall chart
        layout.content.push({
            "image": charts[`chart-data-${boxId}`].exportedImage,
            "fit": [523, 600]
        });
        layout.content.push({
            "image": charts[`chart-data-per-box-${boxId}`].exportedImage,
            "fit": [523, 600]
        });

        // Let's add table

        layout.content.push({
            text: window.MESSAGES.reportedIssues, fontSize: 14, bold: true, margin: [0, 20, 0, 8]
        });

        layout.content.push({
            table: {
                //headerRows: 1,
                // dontBreakRows: true,
                // keepWithHeaderRows: 1,
                widths: [125, 125, 125, 125],
                body: getEntriesBody(boxId)
            },
            layout: 'lightHorizontalLines',
            pageBreak: 'after'
        });
    }


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