function FreecarMap(from, to) {
    this.from = from;
    this.to = to;
}

FreecarMap.prototype.map;
FreecarMap.prototype.markers;
FreecarMap.prototype.directionsDisplay;
FreecarMap.prototype.directionsService;
FreecarMap.prototype.geocoder;

FreecarMap.prototype.calcRoute = function (start, end, directionsDisplay) {
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    _self = this;
    this.directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            _self.directionsDisplay.setDirections(response);
            for(var i = 0; i < _self.markers.length; i++)
                _self.markers[i].setMap(null);
        }
    });
}

FreecarMap.prototype.setLocName = function (geocode, elem) {
    this.geocoder.geocode( { 'latLng': geocode, 'region': 'hy'},
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                elem.val(results[0].formatted_address);
            }
        });
}

FreecarMap.prototype.initialize = function (divId) {
    this.markers = new Array();

    // map
    this.map = new google.maps.Map(document.getElementById(divId),
        {
            center: new google.maps.LatLng(40.181, 44.515),
            zoom: 14,
            mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            draggableCursor: 'crosshair'
        });
    
    // geocoder
    this.geocoder = new google.maps.Geocoder();
    
    // directions
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer({draggable: true});
    var locations = new Array();

    var _self = this;
    google.maps.event.addListener(this.map, 'click',  function (event) {
        if(locations.length == 2) return;

        var marker = new google.maps.Marker({
            position: event.latLng,
            map: _self.map
        });
        _self.markers.push(marker);
        google.maps.event.addListener(marker, "dblclick", function() {
            marker.setMap(null);
        });
        google.maps.event.addListener(marker, 'click', function(){});
            locations.push(event.latLng);
            if(locations.length == 1)
                _self.setLocName(event.latLng, _self.from);
            else {
                _self.setLocName(event.latLng, _self.to);
                _self.calcRoute(locations[0], locations[1]);
            }
        });

    this.directionsDisplay.setMap(this.map);
};

