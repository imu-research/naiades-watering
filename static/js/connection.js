$(function() {
    const $connectionStatus = $("#connection-status");

    function loadConnectionStatus() {
        $.ajax({
            url: '/watering/api/connection/status',
            type: 'GET',
            success: function(data) {
                $connectionStatus
                    .removeClass("unknown connected disconnected");

                if (data.connection_status) {
                    $connectionStatus
                        .addClass("connected")
                        .text(window.MESSAGES.waterFlowConnected);
                }
                else if (data.connection_status === false) {
                    $connectionStatus
                        .addClass("disconnected")
                        .text(window.MESSAGES.waterFlowDisconnected);
                }
                else {
                    $connectionStatus
                        .addClass("unknown")
                        .text(window.MESSAGES.waterFlowStatusUnavailable);
                }
            }
        });
    }

    // initial request
    loadConnectionStatus();

    // refresh every 60 seconds
    window.setInterval(function() {
        loadConnectionStatus();
    }, 1000 * 60);
});
