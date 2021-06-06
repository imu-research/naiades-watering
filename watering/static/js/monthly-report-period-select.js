$(function() {

    // grab start/end
    const originalStart = moment(window.PERIOD_START, "DDMMYYYY");
    const originalEnd = moment(window.PERIOD_END, "DDMMYYYY");

    // handle period change
    function onDateChange(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

        if ((start !== originalStart) || (end !== originalEnd)) {
            window.location.href = `/watering/monthlyReport/?from=${start.format("DDMMYYYY")}&to=${end.format("DDMMYYYY")}`
        }
    }

    // add options & configure
    $('#reportrange').daterangepicker({
        startDate: originalStart,
        endDate: originalEnd,
        ranges: {
            'Last 7 Days': [moment().subtract(7, 'days'), moment()],
            'Last 14 Days': [moment().subtract(14, 'days'), moment()],
            'Last 30 Days': [moment().subtract(30, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, onDateChange);

    // trigger on change
    onDateChange(originalStart, originalEnd);
});