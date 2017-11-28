var map;

var locations = [
    {
        title: "Henderson of Edinburgh",
        location: {lat: 55.9543, lng: -3.1980},
        venue_id: "4b058822f964a520d9b322e3",
        description: "Vegetarian, vegan, organic and fresh, with the tastiest veggie haggis in town!",
        type: "AFFORDABLE"
    },
    {
        title: "The Gardener's Cottage",
        location: {lat: 55.9575, lng: -3.1807},
        venue_id: "500b03b9e4b03e9236b232fb",
        description: "The coolest place with the most interesting, seasonal tasting menus in Edinburgh!",
        type: "UPPER-MID RANGE"
    },
    {
        title: "Earthy Foods and Goods",
        location: {lat: 55.934634, lng: -3.178672},
        venue_id: "4bc051ac920eb71397c8182c",
        description: "Alternative, close to nature place with fresh, organic, local and super tasty foods! Highly recommend the most amazing salads!",
        type: "AFFORDABLE"
    },
    {
        title: "Roseleaf",
        location: {lat: 55.9760, lng: -3.1735},
        venue_id: "4b239e33f964a520435724e3",
        description: "Every Mad Hatter's favourite pub/bistro food in Edinburgh!",
        type: "AFFORDABLE"
    },
    {
        title: "Aizle",
        location: {lat: 55.9418, lng: -3.1788},
        venue_id: "53501746498e711ba8d597b5",
        description: "Local, seasonal tasting menus paired with great cocktails!",
        type: "UPPER-MID RANGE"
    },
    {
        title: "Peter's Yard",
        location: {lat: 55.9436, lng: -3.1919},
        venue_id: "4b2656aaf964a520517a24e3",
        description: "Best crisp swedish bread, fresh quick lunch options and the best swedish cinnamon buns in town!",
        type: "AFFORDABLE"
    },
    {
        title: "Kalpna",
        location: {lat: 55.9435, lng: -3.1832},
        venue_id: "4b058821f964a520b9b322e3",
        description: "Vegetarian, indian food, full of flavour  ",
        type: "AFFORDABLE"
    }

];


function ViewModel() {
    "use strict";
    var self = this;
    //COLLECTION. HOLDS THE ARRAY OF MARKERS

    self.markers = ko.observableArray([]);


    //ADDS STYLINGS TO THE MARKERS
    self.makeMarkerIcon = function (markerColor) {
        console.log("making An Icon");
        var markerImage = new google.maps.MarkerImage(
            "http://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_pinetree|" + markerColor,
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34)
        );
        return markerImage;
    };

    self.defaultIcon = self.makeMarkerIcon("55823a");
    self.highlightedIcon = self.makeMarkerIcon("e8ce17");

    //CREATES NEW MARKER FOR EACH LOCATION AND LOOPS THROUGH IT
    locations.forEach(function (location) {
        var marker = new google.maps.Marker({
            position: location.location,
            title: location.title,
            venue_id: location.venue_id,
            description: ko.observable(location.description),
            type: location.type,
            icon: self.defaultIcon,
            animation: google.maps.Animation.DROP,
            map: map,
            filtered: ko.observable(false)
        });
        //LISTENERS FOR THE MOUSE ACTIONS
        marker.addListener("click", function () {
            self.populateInfoWindow(this, self.largeInfoWindow);
        });
        marker.addListener("mouseover", function () {
            this.setIcon(self.highlightedIcon);
        });
        marker.addListener("mouseout", function () {
            this.setIcon(self.defaultIcon);
        });
        //PUSHES NEW MARKER TO THE MARKERS
        self.markers.push(marker);
    });


    // INFO WINDOW DISPLAYED ON SELECTED MARKERS. CHANGES DYNAMICALLY
    self.largeInfoWindow = new google.maps.InfoWindow();

    // CLEAR ANY ANIMATIONS ON THE MARKERS
    self.clearMarkersAnimation = function () {
        self.markers().forEach(function (marker) { marker.setAnimation(null); });
    };

    self.populateInfoWindow = function (marker, infoWindow) {
        var content = "";
        self.clearMarkersAnimation();
        marker.setAnimation(google.maps.Animation.BOUNCE);
        if (infoWindow.marker !== marker) {
            infoWindow.marker = marker;
            // MAKE AJAX REQUEST TO FOURSQUARE API
            $.ajax({
                type: "GET",
                url: "https://api.foursquare.com/v2/venues/" + marker.venue_id,
                data: {
                    client_id: "2HASOPYCNKRPVQ4U0L21TRQ54CWQRFD5YKPTE5SPZ1BXZLAB",
                    client_secret: "HIMK4V53L5IXIB0HVREBO04JN5UQU0R55WZLOSMPLA33DAJM",
                    v: "20170801"
                },
                success: function (data) {
                    try {
                        content += "<h4>Address: </h4><h3>" + data.response.venue.location.formattedAddress + "</h3>";
                        content += "<h4>Call us: </h4><p>" + data.response.venue.contact.formattedPhone + "</p>";
                        content += "<h4>Website: </h4><p>" + data.response.venue.url + "</p>";
                        content += "<h4>Prices: </h4><p>" + data.response.venue.price.message + "</p>";
                        content += "<h4>Rating: </h4><p>" + data.response.venue.rating + "</p>";
                    } catch (err) {
                        content = "<p>Oh, no!!! Unable to get info at the moment!</p>";
                        //LOG ERROR TO THE CONSOLE
                        console.log("Error: " + err);
                    }
                    infoWindow.setContent(content);
                    infoWindow.addListener("closeclick", function () {
                        infoWindow.marker = null;
                        marker.setAnimation(null);
                    });
                    infoWindow.open(map, marker);
                },
                error: function () {
                    alert("Oh No, Your request did not succeed!");
                    content += "Could not retrieve data";
                    infoWindow.setContent(content);
                    infoWindow.addListener("closeclick", function () {
                        infoWindow.marker = null;
                        marker.setAnimation(null);
                    });
                    infoWindow.open(map, marker);
                }
            });
        }
    }; //END populateInfoWindow

    // CALL populateInfoWindow AND PASS IN self.largeInfoWindow.
    // USED IN THE LIST VIEW IN index.html
    self.populateInfoWindowByListClick = function (marker) {
        self.hideMarkers();
        marker.setVisible(true);
        marker.filtered(false);
        self.populateInfoWindow(marker, self.largeInfoWindow);
    };

    // DISPLAY ALL THE MARKERS ON THE MAP
    self.showMarkers = function () {
        self.largeInfoWindow.marker = null;
        self.largeInfoWindow.close();
        self.markers().forEach(function (marker) {
            marker.setVisible(true);
            marker.filtered(false);
            marker.setAnimation(null);
        });
    };

    // HIDE ALL THE MARKERS
    self.hideMarkers = function () {
        self.largeInfoWindow.marker = null;
        self.largeInfoWindow.close();
        self.markers().forEach(function (marker) {
            marker.setVisible(false);
            marker.filtered(true);
            marker.setAnimation(null);
        });
    };

    // FILTER DIPLAYED MARKERS BASED ON USER SELECTION
    self.filterMarkers = function (filterCriteria) {
        self.largeInfoWindow.marker = null;
        self.largeInfoWindow.close();
        self.markers().forEach(function (marker) {
            marker.setAnimation(null);
            if (marker.type != filterCriteria) {
                marker.setVisible(false);
                marker.filtered(true);
            } else {
                marker.setVisible(true);
                marker.filtered(false);
            }
        });
    };

} // END ViewModel().


// INITALIZE THE GOOGLE MAP TO DISPLAY ON THE PAGE
function initMap() {
    var edi = {lat: 55.9533, lng: -3.1883};

    var styles = [
        {
            featureType: "landscape.natural",
            elementType: "geometry",
            stylers: [{color: "#86C67C"}]
        },
        {
            featureType: "landscape.man_made",
            elementType: "geometry",
            stylers: [{color: "#C4BC68"}]
        },
        {
            featureType: "water",
            stylers: [{color: "#2b7f58"}]
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{lightness: 100}]
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{lightness: -100}]
        },
        {
            featureType: "administrative",
            elementType: "labels.text.stroke",
            stylers: [
                {color: "#ffffff"},
                {weight: 6}
            ]
        },
        {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{color: "#e85113"}]
        },
        {
            featureType: "transit.station",
            stylers: [
                {weight: 9},
                {hue: "#e85113"}
            ]
        },
        {
            featureType: "transit.station.rail",
            stylers: [{color: "#4C0000"}]
        },
        {
            featureType: "poi",
            elementType: "geometry",
            stylers: [
                {visibility: "on"},
                {color: "#f2ce21"}
            ]
        },
        {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [{color: "#43ba5a"}]
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{color: "#447530"}]
        },
        {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [
                {color: "#003C64"},
                {lightness: 30}
            ]
        },
        {
            featureType: "road.highway",
            elementType: "labels.icon",
            stylers: [{visibility: "off"}]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [
                {color: "#EC8048"},
                {lightness: -25}
            ]
        }
    ];

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        styles: styles,
        center: edi
    });


// BIND THE ViewModel TO OUT PAGE INSIDE OF initMap
    ko.applyBindings(new ViewModel());
} // END initMap().

// HANDLE ANY FAILURES LOADING THE MAP.
function mapsError() {
    alert("Oh no, something went wrong! The map isn't loading:(\nPlease try back later.")
}

