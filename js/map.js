'use strict';

var map = null;
var mapBounds = null;

function createMap() {
    var startingPoints = [{
            placeName: 'New York, Metropolitan Opera House',
            lat: 40.7731527,
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
        center: {
            lat: startingPoint.lat,
            lng: startingPoint.lng
        },
        disableDoubleClickZoom: true
    };

    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    // hacky way of attaching to google maps double click
    // http://stackoverflow.com/questions/5329136/handling-click-events-in-google-maps-js-api-v3-while-ignoring-double-clicks

    //used to prevent single click events when doing double clicks
    var update_timeout = null;

    google.maps.event.addListener(map, 'click', function(event) {
        update_timeout = setTimeout(function() {
            // event fired in case of map click
        }, 200);
    });

    var placeMarker = function(position) {
        return new google.maps.Marker({
            position: position,
            map: map,
            title: 'NewLocation',
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
    };

    google.maps.event.addListener(map, 'dblclick', function(event) {
        clearTimeout(update_timeout);

        window.viewModel.addLocation(event.latLng, placeMarker(event.latLng));
        event.stop();
    });

    // add places search
    var searchBox = document.getElementById('place-filter');
    var menuButton = document.getElementById('menu-toggle');

    searchBox.style.maxWidth = '200px';
    menuButton.style.width = 'auto';

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(menuButton);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBox);

    var autocomplete = new google.maps.places.Autocomplete(searchBox);
    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // silently quit
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            window.viewModel.addLocation(place.geometry.location, placeMarker(place.geometry.location));
        }
    });
}

function getLocation(placeName) {
    var service = new google.maps.places.PlacesService(map);
    service.textSearch({
        query: placeName
    }, function(results, status) {
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
