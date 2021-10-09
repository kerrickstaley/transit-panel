"use strict";

var newport_pkwy_station_id = '3199';
var station_status_url = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

var request = new XMLHttpRequest();
request.open('GET', station_status_url, true);
request.onload = function() {
    var data = JSON.parse(request.response);
    var station_status = data.data.stations.find(el => el.station_id === newport_pkwy_station_id);
    document.querySelector('body').innerHTML = 'Bikes available: ' + station_status.num_bikes_available;
};
request.send();

var request2 = new XMLHttpRequest();
request2.open('GET', 'https://path.api.razza.dev/v1/stations/hoboken/realtime');
request2.onload = function() {
    var data = JSON.parse(request2.response);
    console.log(data);
};
request2.send();
