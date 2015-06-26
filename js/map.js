'use strict';

var map = null;
var mapBounds = null;

function createMap() {
    var startingPoints = [
        {
            placeName: 'New York, Metropolitan Opera House',
            lat : 40.7731527,
            lng: -73.98493630000002
        }
        // {
        //     placeName: 'Paris, Eiffel Tower',
        //     lat: 48.85837,
        //     lng: 2.294481000000019
        // },
        // {
        //     placeName: 'Moscow, Red Square',
        //     lat: 55.75393,
        //     lng: 37.620795000000044
        // }
    ];

    var startingPoint = startingPoints[Math.floor(Math.random() * startingPoints.length)];

    var mapOptions = {
        disableDefaultUI: true,
        maxZoom: 25,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: {lat: startingPoint.lat, lng: startingPoint.lng},
        disableDoubleClickZoom: true
    };

    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    // hacky way of attaching to google maps double click
    // http://stackoverflow.com/questions/5329136/handling-click-events-in-google-maps-js-api-v3-while-ignoring-double-clicks

    //used to prevent single click events when doing double clicks
    var update_timeout = null;

    google.maps.event.addListener(map, 'click', function(event){
        update_timeout = setTimeout(function(){
            // event fired in case of map click
        }, 200);
    });

    var placeMarker = function (position) {
        return new google.maps.Marker({
            position: position,
            map: map,
            title: 'NewLocation',
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
    };

    google.maps.event.addListener(map, 'dblclick', function(event) {
        clearTimeout(update_timeout);

        viewModel.addLocation(event.latLng, placeMarker(event.latLng));
        event.stop();
    });


    // add places search

    var input = document.getElementById('place-filter'));
}

function getLocation(placeName) {
    var service = new google.maps.places.PlacesService(map);
    service.textSearch({ query: placeName }, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results[0].geometry.location.lat());
            console.log(results[0].geometry.location.lng());
        }
    });
}

// Map initialization
window.addEventListener('load', createMap);

// Fix map size on window resize
window.addEventListener('resize', function(evt) {
    map.fitBounds(mapBounds);
});
