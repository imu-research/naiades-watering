 if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          function (position) {
              var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              //Get list of boxes that needs watering
              var targets = loadData();
              //Find boxes that are nearby
              var locations = geofence(pos,targets);
              console.log(locations)
              //ask for feedback

          }
      );
  }

function geofence(origin, targets) {
    var locations = [];
     if (targets.length == 0 ){
        //no target
    }
    else if(waypoints.length > 1){
        for(var i=0;i<waypoints.length;i++) {
            if (distance(waypoints[i], origin) < 0.03) {
                locations.push(waypoints[i])
            }
        }

    }
    return locations;

}

function loadData() {
    const that = this;
    $.ajax({
        url: '/watering/api/boxes/list',
        success: function (response) {
            const boxes = response.boxes;
            const today = new Date();

            $.each(boxes, function (idx, box) {
                // check if setup
                //box.isSetup = that.isSetup(box);

                // set next watering
                //box.nextWatering = 'UNKNOWN';
                if (!box.nextWateringDeadline) {
                    return
                }

                const parts = box.nextWateringDeadline.split('T')[0].split('-');

                // get watering
                const nextWateringDate = new Date(
                    Number.parseInt(parts[0]),
                    Number.parseInt(parts[1]) - 1,
                    Number.parseInt(parts[2])
                );

                // same date?
                if ((nextWateringDate.getFullYear() === today.getFullYear()) &&
                    (nextWateringDate.getMonth() === today.getMonth()) &&
                    (nextWateringDate.getDate() === today.getDate())) {
                    box.nextWatering = 'TODAY';
                }

                // next date?
                // TODO improve check - this fails for the last day of the month
                else if ((nextWateringDate.getFullYear() === today.getFullYear()) &&
                    (nextWateringDate.getMonth() === today.getMonth()) &&
                    (nextWateringDate.getDate() - 1 === today.getDate())) {
                    box.nextWatering = 'TOMORROW';
                }

                // in the past?
                else if (nextWateringDate < today) {
                    box.nextWatering = 'UNKNOWN';
                } else {
                    // just future
                    box.nextWatering = 'FUTURE';
                }

            });

            that.fetchedMeasurements = boxes;
            that.measurements = boxes;

            // filter & show
            const waypoints = FilteredMeasurements(that.measurements);
            /*if(waypoints.length >0) {
                displayRoute(waypoints);
            }*/
            return waypoints;
        }
    })
}

function FilteredMeasurements(m) {

            // get selection
            const nextWatering = 'TODAY';

            // clear all
            //clear(m);

            // filter
            const measurements = m
                .filter(box => nextWatering === "" || box.nextWatering === nextWatering);

            // return points
            const waypoints = render(measurements);
            console.log(waypoints)
            return waypoints;
        }
function distance(position1,position2){
    var lat1=position1.lat();
    var lat2=position2.lat();
    var lon1=position1.lng();
    var lon2=position2.lng();
    var R = 6371; // Radius of the earth in km
    var dLat = toRadians(lat2-lat1);  // deg2rad below
    var dLon = toRadians(lon2-lon1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function toRadians(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

