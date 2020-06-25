$(function () {
    window.NaiadesMap = {
        map: null,
        marker: null,
        center: {
            lat: 46.1838136,
            lng: 6.138625
        },

        init: function() {
            this.initMap();
            this.initAutocomplete();
            this.initCurrentLocationBtn();
        },

        initAutocomplete() {
            // create search bar
            const $autocompleteInput = $('<input />')
                .addClass('form-control address-search');
            const autocomplete = new google.maps.places.Autocomplete($autocompleteInput.get(0), {
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(NaiadesMap.center.lat - 0.05, NaiadesMap.center.lng - 0.05),
                    new google.maps.LatLng(NaiadesMap.center.lat + 0.05, NaiadesMap.center.lng + 0.05)
                )
            });
            autocomplete.addListener('place_changed', function() {
                const place = autocomplete.getPlace();

                NaiadesMap.setMarkerPosition(place.geometry.location.lat(), place.geometry.location.lng());
            });

            // add autocomplete to map container
            $autocompleteInput.insertBefore($('#mapid'));
        },

        initCurrentLocationBtn: function() {
            const $btn = $('<div />')
                .addClass('btn btn-default location-btn')
                .append($('<span />').text('Current position'))
                .on('click', function () {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            position => NaiadesMap.setMarkerPosition(
                                position.coords.latitude,
                                position.coords.longitude
                            )
                        );
                    } else {
                        $btn.addClass('disabled')
                    }
                });

            $btn.insertBefore($('#mapid'));
        },

        initMap: function() {
            const map = L.map('mapid').setView([NaiadesMap.center.lat, NaiadesMap.center.lng], 15);

            L.tileLayer(
                'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: 'pk.eyJ1IjoiZXZhbmdlbGllOTAiLCJhIjoiY2thanU1YzFrMGU5MDJ6anVtY3FpdDQwaiJ9.G5trmcJe4LgebhQxVzgVMw'
                }
            ).addTo(map);

            // on map click, capture position
            map.on('click', function(e){
                NaiadesMap.setMarkerPosition(e.latlng.lat, e.latlng.lng);
            });

            // keep ref to map
            this.map = map;
        },

        setMarkerPosition: function(lat, lng) {
            const latlng = [lat, lng];

            // if marker exists, delete
            if (NaiadesMap.marker) {
                NaiadesMap.marker.remove();
            }

            // get map
            const map = NaiadesMap.map;

            // Add marker to map at click location; add popup window
            const marker = new L.marker(latlng, {draggable:'true'}).addTo(map);

            // Make marker draggable
            marker.on('dragend', function(){

                // move marker
                const position = marker.getLatLng();
                marker.setLatLng(new L.LatLng(position.lat, position.lng), {draggable:'true'});
                map.panTo(new L.LatLng(position.lat, position.lng));

                // update selected position
                NaiadesMap.onPositionSelected(position.lat, position.lng)
            });

            // keep ref to marker
            NaiadesMap.marker = marker;

            // trigger on position selected
            NaiadesMap.onPositionSelected(lat, lng)
        },

        onPositionSelected: function(lat, lng) {
            // get address from position
            const key = 'AIzaSyAeXisjnsAMK0rYoxNNOPPdtc9JFF7OL_w';
            $.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`, function(data){
                // get address
                const address = data.results[0].formatted_address;

                // update form inputs
                NaiadesMap.updateFormInputs(lat, lng, address)
            });
        },

        updateFormInputs(lat, lng, address) {
            $('#id_latitude').val(lat);
            $('#id_longitude').val(lng);
            $('#id_address').val(address);
        }
    };

    // initialize map
    NaiadesMap.init();
});