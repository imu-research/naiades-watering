$(function() {
    $("#id-automatic-cluster-redirect").on("change", function() {
        const isChecked = $(this).prop("checked");

        // set cookie
        document.cookie = `disable_automatic_cluster_redirect=${isChecked ? '' : 'yes'}`;

        // update setting
        window.SETTINGS.disableAutomaticClusterRedirect = !isChecked;
    });
});