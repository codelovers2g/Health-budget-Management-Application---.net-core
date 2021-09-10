// This sample uses the Places Autocomplete widget to:
// 1. Help the user select a place
// 2. Retrieve the address components associated with that place
// 3. Populate the form fields with those address components.
// This sample requires the Places library, Maps JavaScript API.
// Include the libraries=places parameter when you first load the API.
// For example: <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

//let autocomplete;
//let address1Field;
//let address2Field;
//let address3Field;
//let postalField;


//Api key: <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=googleApi.initAutocomplete&libraries=places&v=weekly" async></script>
var googleApi = {
    bounds: "",
    markersArray: [],
    map: "",
    AuMAP: "",
    geocoder: "",
    service: "",
    TotalDistance: 0,
    count: 0,
    test: 1,
    testnew: 1,
    EditKms: 0,
    EditKMCalculatedKm: 0,
    init: function () {
        if (googleApi.test == 1) {
            googleApi.initAutocomplete();
        }
    },

    initAutocomplete: function () {
		//Map initialization
        googleApi.map = new google.maps.Map($("#map_canvas")[0], {
            center: { lat: -33.865143, lng: 151.209900 },
            zoom: 3,
        });
		
		//Address Fields initialization(place api implementation)
        var startLocationAutoComplete = new google.maps.places.Autocomplete($("#txtStartLocationAddress")[0], {
            fields: ["address_components", "geometry"],
            types: ["address"]
        });
        startLocationAutoComplete.setComponentRestrictions({
            country: ["au"]
        });

        var serviceDeliveryAutoComplete = new google.maps.places.Autocomplete($("#txtServiceDeliveryAddress")[0], {
            fields: ["address_components", "geometry"],
            types: ["address"],
        });
        serviceDeliveryAutoComplete.setComponentRestrictions({
            country: ["au"]
        });

        var endLocationAutoComplete = new google.maps.places.Autocomplete($("#txtendLocationAddress")[0], {
            fields: ["address_components", "geometry"],
            types: ["address"],
        });
        endLocationAutoComplete.setComponentRestrictions({
            country: ["au"]
        });
		
		//Address Fields On change event
        google.maps.event.addListener(startLocationAutoComplete, 'place_changed', googleApi.CheckAddressFieldsFilled);
        google.maps.event.addListener(serviceDeliveryAutoComplete, 'place_changed', googleApi.CheckAddressFieldsFilled);
        google.maps.event.addListener(endLocationAutoComplete, 'place_changed', googleApi.CheckAddressFieldsFilled);
        googleApi.test = 0;
    },

    CheckAddressFieldsFilled: function () {
        if ($("#txtStartLocationAddress").val() != "" && $("#txtServiceDeliveryAddress").val() != "" && $("#txtendLocationAddress").val() != "") {
            googleApi.initMap();

        }
    },


    initMap: function () {
		//Distance Matrix api implementation
        googleApi.TotalDistance = 0;
        googleApi.map = new google.maps.Map($("#map_canvas")[0], {
            center: { lat: -33.865143, lng: 151.209900 },
            zoom: 3,
        });
        googleApi.count = 0;
        googleApi.geocoder = new google.maps.Geocoder();
        googleApi.service = new google.maps.DistanceMatrixService();
        googleApi.bounds = new google.maps.LatLngBounds();
		
		//Array Of start and end address
        var loctionArray =
            [{
                StartAddress: $("#txtStartLocationAddress").val(),
                EndAddress: $("#txtServiceDeliveryAddress").val(),
                StartAddressLetter: 'SL',
                EndAddressLetter: 'SA',
                StartAddressColor: 'FF0000',
                EndAddressColor: 'FFFF00'
            },
            {
                StartAddress: $("#txtServiceDeliveryAddress").val(),
                EndAddress: $("#txtendLocationAddress").val(),
                StartAddressLetter: 'SA',
                EndAddressLetter: 'EL',
                StartAddressColor: 'FFFF00',
                EndAddressColor: '00FF00'
            }]
        if (googleApi.markersArray.length > 0)
            googleApi.deleteMarkers(googleApi.markersArray);
        loctionArray.forEach(x => {
            googleApi.service.getDistanceMatrix(
                {
                    origins: [x.StartAddress],
                    destinations: [x.EndAddress],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false,
                },
				//Response of Location Array 
                (response, status) => {
                    const results = response.rows[0].elements;
					
					//Distance Calculated between two points
                    googleApi.TotalDistance += parseInt(results[0].distance.value);
                    googleApi.geocoder.geocode(
                        { address: x.StartAddress },
                        googleApi.showGeocodedAddressOnMap(x.StartAddressLetter, x.StartAddressColor)
                    );
                    googleApi.geocoder.geocode(
                        { address: x.EndAddress },
                        googleApi.showGeocodedAddressOnMap(x.EndAddressLetter, x.EndAddressColor)
                    );
                    if (googleApi.EditKms == 1) {
                        if (googleApi.EditKMCalculatedKm != 0) {
                            googleApi.count++;
                            $("#txtCalculatedKMsAssigned").val(googleApi.EditKMCalculatedKm);
                            if (googleApi.count == 2) {
                                googleApi.EditKMCalculatedKm = 0;
                            }
                        }
                        else {
                            $("#txtCalculatedKMsAssigned").val((googleApi.TotalDistance / 1000).toFixed(2));
                        }
                    }
                    else {
                        $("#txtCalculatedKMsAssigned").val((googleApi.TotalDistance / 1000).toFixed(2));
                    }
                    if ($("#ddlNoOfParticipants").val() != "") {
                        googleApi.CalculateDisctance();
                    }

                }
            );
        })
    },

    CalculateDisctance: function () {
        if ($("#txtStartLocationAddress").val() != "" && $("#txtServiceDeliveryAddress").val() != "" && $("#txtendLocationAddress").val() != "") {
            var distance = $("#txtCalculatedKMsAssigned").val();
            $("#txtLegDistance").html($("#txtCalculatedKMsAssigned").val());
            $("#txtLegDistanceres").html($("#txtCalculatedKMsAssigned").val());
            $("#txtParticipants").html($("#ddlNoOfParticipants").val());
            $("#txtParticipantsres").html($("#ddlNoOfParticipants").val());
            distance = distance / $("#ddlNoOfParticipants").val();
            distance = distance.toFixed(2);
            $("#osDistance").html(distance);
        }
    },

    deleteMarkers: function (markersArray) {
		//Delete markers from map
        for (let i = 0; i < markersArray.length; i++) {
            googleApi.markersArray[i].setMap(null);
        }
        googleApi.markersArray = [];
    },

    showGeocodedAddressOnMap: function (letter, color) {
		//Geocode api implementation to show markers on map
        var icon = `https://chart.apis.google.com/chart?chst=d_map_spin&chld=0.6|1|${color}|11|_|${letter}`;
        var map = googleApi.map;
        return function (results, status) {
            if (status === "OK") {
                map.fitBounds(googleApi.bounds.extend(results[0].geometry.location));
                googleApi.markersArray.push(
                    new google.maps.Marker({
                        map,
                        position: results[0].geometry.location,
                        icon: icon,
                        title: results[0].formatted_address
                    })
                );
            } else {
                alert("Geocode was not successful due to: " + status);
            }
        };

    },


}

$(document).ready(function () {
    googleApi.init();
})
