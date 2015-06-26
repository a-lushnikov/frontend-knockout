'use strict';

$(document).ready(function() {
    // TODO : move to server side and do not show to anyone ;)
    var forsquare_access = {
        clientId: '13VQ4NTCS0U33XREVAZLYWOPN3NXDNLHOGKL1SJNRAPZL0FZ',
        clientSecret: 'EUJ5KAQEQRFUFLIDNS21ZT4KQ3J5RX2XVAGY2YBOT21HGUVX'
    };

    // instanciate once
    var geocoder = new google.maps.Geocoder();

    // Point of interest model to represent data of top pick place
    var Poi = function(placeName, contact, location, category, icon, opened) {
        this.placeName = ko.observable(placeName);
        this.contact = ko.observable(contact);
        this.location = ko.observable(location);
        this.category = ko.observable(category);
        this.icon = ko.observable(icon);
        this.opened = ko.observable(opened);
    };

    // Location found on the map
    var Location = function(location, marker) {
        var that = this;
        this.location = location;
        this.marker = marker;

        var defaultPlaceAddress = 'Fetching address...';
        this.geocode = null;

        this.country = ko.observable('');
        this.city = ko.observable('');
        this.street = ko.observable('');
        this.building = ko.observable('');
        this.address = ko.observable(defaultPlaceAddress);

        // fetched from forsquare
        this.topPicks = ko.observableArray([]);

        google.maps.event.addListener(marker, 'click', function() {
            window.viewModel.selectLocation(that);
            $('#placesModal').modal('show');
            map.panTo(marker.location);
        });

        // get place name by lat / lng
        geocoder.geocode({
            'latLng': location
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                that.address(results[0].formatted_address);
                that.geocode = results;

                // get required address components
                var address = results[0];

                // extract country, city, street
                for (var i = 0, n = address.address_components.length; i < n; i++) {
                    var component = address.address_components[i];
                    if (component.types.indexOf('street_number') > -1) {
                        that.building(component.long_name);
                    } else if (component.types.indexOf('route') > -1) {
                        that.street(component.long_name);
                    } else if (component.types.indexOf('locality') > -1) {
                        that.city(component.long_name);
                    } else if (component.types.indexOf('country') > -1) {
                        that.country(component.long_name);
                    }
                }
            } else {
                // in case request to google maps API has failed
                if (that.address() === defaultPlaceAddress) {
                    that.address('Failed to fetch location address');
                }
            }
            marker.setTitle(that.address());
        });

        var getPicks = function () {
            var counter = 0;
            // get at most 8 top picks locations from forsquare
            $.ajax('https://api.foursquare.com/v2/venues/explore?' + $.param({
                ll: location.lat() + ',' + location.lng(),
                client_id: forsquare_access.clientId,
                client_secret: forsquare_access.clientSecret,
                section: 'topPicks',
                v: '20150618',
                limit: 8,
                radius: 200
            })).success(function(response) {

                // extract top pick places from response
                that.topPicks([]);

                for (var i = 0, n = response.response.groups[0].items.length; i < n; i++) {
                    var item = response.response.groups[0].items[i].venue;

                    var address = '---';
                    if (item.location && item.location.formattedAddress) {
                        address = item.location.formattedAddress;
                    }

                    var catName = '---';
                    if (item.categories && item.categories[0] && item.categories[0].name) {
                        catName = item.categories[0].name;
                    }

                    var icon = '';
                    if (item.categories && item.categories[0] && item.categories[0].icon) {
                        icon = item.categories[0].icon.prefix + '64' + item.categories[0].icon.suffix;
                    }

                    var hours = '';
                    if (item.hours && item.hours.status) {
                        hours = item.hours.status;
                    }

                    that.topPicks.push(
                        new Poi(item.name || 'Unknown place',
                            item.contact.formattedPhone || 'No contact specified',
                            address,
                            catName,
                            icon,
                            hours)
                    );
                }
            }).fail(function() {
                if(counter < 2) {
                    counter = counter + 1;
                    getPicks();
                } else {
                    alert('Ups. Something went wrong. We could have apologised, but that is either your connection or forsquare failing - not our beautiful website.');
                }
            });
        };

        getPicks();
    };

    // knockout view model
    var ViewModel = function() {
        var that = this;

        this.filterCountry = ko.observable('');
        this.filterCity = ko.observable('');
        this.filterStreet = ko.observable('');

        this.selectedLocation = ko.observable();

        this.locations = ko.observableArray([]); // no locations by default

        this.selectLocation = function(place) {
            // unselect previous place
            if (that.selectedLocation()) {
                that.selectedLocation().marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
            }

            place.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
            map.panTo(place.marker.position);
            that.selectedLocation(place);
        };

        this.i = 0;
        this.startBounce = function(place) {
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
        };

        this.stopBounce = function(place) {
            place.marker.setAnimation(null);
        };

        this.filterLocations = function() {
            // do nothing in case we have no filtering options
            if (!this.filterCountry() && !this.filterCity() && !this.filterStreet()) {
                return;
            }

            var locations = this.locations();
            for (var i = locations.length - 1; i >= 0; i--) {
                var location = locations[i];
                if (this.filterCountry() && location.country().toLowerCase().indexOf(this.filterCountry().toLowerCase()) === -1) {
                    this.removeLocation(locations[i]);
                } else if (this.filterCity() && location.city().toLowerCase().indexOf(this.filterCity().toLowerCase()) === -1) {
                    this.removeLocation(locations[i]);
                } else if (this.filterStreet() && location.street().toLowerCase().indexOf(this.filterStreet().toLowerCase()) === -1) {
                    this.removeLocation(locations[i]);
                }
            }
            this.locations(locations);
        };

        this.addLocation = function(location, marker) {
            this.locations.push(new Location(location, marker));
        };

        this.removeLocation = function(location) {
            var locations = this.locations();
            for (var i = locations.length - 1; i >= 0; i--) {
                if (locations[i] === location) {
                    location.marker.setMap(null); // removing visual
                    locations.splice(i, 1); // removing data
                }
            }
            this.locations(locations);
        };

        this.clearLocations = function() {
            for (var i = this.locations().length - 1; i >= 0; i--) {
                this.removeLocation(this.locations()[i]);
            }
        };
    };

    window.viewModel = new ViewModel();
    ko.applyBindings(window.viewModel);

    // bind sidebar
    $('#menu-toggle').click(function(e) {
        e.preventDefault();
        $('#wrapper').toggleClass('toggled');

        // triggering resize event to force google map redraw
        setTimeout(function() {
            google.maps.event.trigger(map, 'resize');
        }, 1000);
    });

    // we could have started with sidebar toggled by using css
    // but then google maps have issue with properly determining necessary
    // amount of tiles visible on screen
    if(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) >= 768) {
        $('#wrapper').toggleClass('toggled');
    }
});
