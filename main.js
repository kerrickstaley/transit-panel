"use strict";

var newport_pkwy_station_id = '3199';
var station_status_url = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

// var request = new XMLHttpRequest();
// request.open('GET', station_status_url, true);
// request.onload = function() {
//     var data = JSON.parse(request.response);
//     var station_status = data.data.stations.find(
//         el => el.station_id === newport_pkwy_station_id
//     );
//     document.querySelector('body').innerHTML = 'Bikes available: ' + station_status.num_bikes_available;
// };
// request.send();

// var request2 = new XMLHttpRequest();
// request2.open('GET', 'https://path.api.razza.dev/v1/stations/hoboken/realtime');
// request2.onload = function() {
//     var data = JSON.parse(request2.response);
//     console.log(data);
// };
// request2.send();

const pathApiUrl = 'https://path.api.razza.dev/v1/stations/hoboken/realtime';
const pathWalkTimeSec = 600;
function populatePathToWtcInfo(elem) {
    const route = "JSQ_33_HOB";
    const direction = "TO_NY";
    var request = new XMLHttpRequest();
    request.open('GET', pathApiUrl, true);
    request.onload = function() {
        var data = JSON.parse(request.response);
        var trainsRaw = data.upcomingTrains.filter(
            train => train.route == route && train.direction == direction
        );
        console.log(trainsRaw);
        var trains = trainsRaw.map(train => {
            var leaveTimeSec = (Date.parse(train.projectedArrival) - new Date())/1000 - pathWalkTimeSec;
            var leaveTimeMin = Math.floor(leaveTimeSec/60);
            return leaveTimeMin;
        }).filter(leaveTimeMin => leaveTimeMin >= -1);
        console.log(trains);

        elem.innerHTML = "";
        elem.style["background-color"] = "#c2fcb6";
        elem.innerHTML = "PATH to WTC";
    };
    request.send();
}; 
// populatePathToWtcInfo(document.querySelector(".row"))


