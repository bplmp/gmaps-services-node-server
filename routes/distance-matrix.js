var express = require('express');
var router = express.Router();
var googleMapsClient = require('@google/maps');
var json2csv = require('json2csv');

// /* GET distance matrix */
// router.get('/', function(req, res, next) {
//     currentClient = googleMapsClient.createClient({
//         key: 'YOUR-KEY'
//     });
//     var originsList = ['1600 Amphitheatre Parkway, Mountain View, CA', '100 Main St, San Franciso, CA'];
//     var destinationsList = ['10 Amphitheatre Parkway, Mountain View, CA', '200 Spring St, San Francisco, CA'];
//     var travelMode = 'driving';
//     var units = 'metric';
//     var language = 'pt-BR';
//     // Geocode an address.
//     currentClient.distanceMatrix({
//         origins: originsList,
//         destinations: destinationsList,
//         mode: travelMode,
//         units: units,
//         language: language
//     }, function(err, response) {
//         if (!err) {
//             console.log(response.json);
//             var data = response.json.rows;
//             var csv = '';
//             var fields = ['distance.text', 'distance.value', 'duration.text', 'duration.value', 'status', 'userOrigin', 'userDestination', 'googleOrigin', 'googleDestination', 'rowId'];
//             csv += fields.join(',') + '\n';
//             for (var i = 0; i < data.length; i++) {
//                 for (var j = 0; j < data[i].elements.length; j++) {
//                     var element = data[i].elements[j];
//                     element.userOrigin = originsList[i];
//                     element.userDestination = destinationsList[j];
//                     element.googleOrigin = response.json.origin_addresses[i];
//                     element.googleDestination = response.json.destination_addresses[j];
//                     element.rowId = i.toString() + j.toString();
//                     try {
//                         var result = json2csv({
//                             data: element,
//                             fields: fields,
//                             hasCSVColumnTitle: false
//                         });
//                         csv += result + '\n';
//                     } catch (err) {
//                         // Errors are thrown for bad options, or if the data is empty and no fields are provided.
//                         // Be sure to provide fields if it is possible that your data array will be empty.
//                         console.error(err);
//                     }
//                 }
//             }
//             console.log(csv);
//             res.send(csv);
//
//         }
//     });
// });

router.post('/', function(request, clientResponse){
  console.log(request.body);      // your JSON
  var requestJson = request.body;
    currentClient = googleMapsClient.createClient({
        key: requestJson.apiKey
    });
    var originsList = requestJson.originAddressList;
    var originsIdList = requestJson.originIdList;
    var destinationsList = requestJson.destAddressList;
    var destinationsIdList = requestJson.destIdList;
    var travelMode = requestJson.travelMode;
    var units = requestJson.units;
    var language = requestJson.language;
    // Geocode an address.
    currentClient.distanceMatrix({
        origins: originsList,
        destinations: destinationsList,
        mode: travelMode,
        units: units,
        language: language
    }, function(err, response) {
        if (!err) {
            console.log(response.json);
            var data = response.json.rows;
            var csv = '';
            var fields = ['distance.text', 'distance.value', 'duration.text', 'duration.value', 'status', 'userOrigin', 'userDestination', 'googleOrigin', 'googleDestination', 'rowId', 'originId', 'destId'];
            csv += fields.join(',') + '\n';
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].elements.length; j++) {
                    var element = data[i].elements[j];
                    element.userOrigin = originsList[i];
                    element.userDestination = destinationsList[j];
                    element.googleOrigin = response.json.origin_addresses[i];
                    element.googleDestination = response.json.destination_addresses[j];
                    element.originId = originsIdList[i];
                    element.destId = destinationsIdList[j];
                    element.rowId = i.toString() + j.toString();
                    try {
                        var result = json2csv({
                            data: element,
                            fields: fields,
                            hasCSVColumnTitle: false
                        });
                        csv += result + '\n';
                    } catch (err) {
                        // Errors are thrown for bad options, or if the data is empty and no fields are provided.
                        // Be sure to provide fields if it is possible that your data array will be empty.
                        console.error(err);
                    }
                }
            }
            console.log(csv);
            var finalResponse = {
              result: csv,
              status: 200
            };
            clientResponse.end(JSON.stringify(finalResponse));
        }
    });
});

module.exports = router;
