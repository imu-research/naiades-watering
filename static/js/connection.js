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
                        .text("Water flow connected successfully");
                }
                else if (data.connection_status === false) {
                    $connectionStatus
                        .addClass("disconnected")
                        .text("Water flow disconnected");
                }
                else {
                    $connectionStatus
                        .addClass("unknown")
                        .text("Water flow connection status could not be retrieved");
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
