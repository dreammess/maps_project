var map;

var locations = [
{
      title: "Henderson of Edinburgh",
      location: {lat: 55.9543 ,lng: -3.1980},
      venue_id: "4b058822f964a520d9b322e3",
      description: "Vegetarian, vegan, organic and fresh, with the tastiest veggie haggis in town!",
      type: 'AFFORDABLE',
    },
    {
      title: "The Gardener's Cottage",
      location: {lat: 55.9575 ,lng: -3.1807},
      venue_id: "500b03b9e4b03e9236b232fb",
      description: "The coolest place with the most interesting, seasonal tasting menus in Edinburgh!",
      type: 'UPPER-MID RANGE'
    },
    {
      title: "Earthy Foods and Goods",
      location: {lat: 55.934634 ,lng: -3.178672},
      venue_id: "4bc051ac920eb71397c8182c",
      description: "Alternative, close to nature place with fresh, organic, local and super tasty foods! Highly recommend the most amazing salads!",
      type: 'AFFORDABLE'
    },
    {
      title: "Roseleaf",
      location: {lat: 55.9760 ,lng: -3.1735},
      venue_id: "4b239e33f964a520435724e3",
      description: "Every Mad Hatter's favourite pub/bistro food in Edinburgh!",
      type: 'AFFORDABLE'
    },
    {
      title: "Aizle",
      location: {lat: 55.9418 ,lng: -3.1788},
      venue_id: "53501746498e711ba8d597b5",
      description: "Local, seasonal tasting menus paired with great cocktails!",
      type: 'UPPER-MID RANGE'
    },
    {
      title: "Peter's Yard",
      location: {lat: 55.9436 ,lng: -3.1919},
      venue_id: "4b2656aaf964a520517a24e3",
      description: "Best crisp swedish bread, fresh quick lunch options and the best swedish cinnamon buns in town!",
      type: 'AFFORDABLE'
    },
    {
      title: "Kalpna",
      location: {lat: 55.9435 ,lng: -3.1832},
      venue_id: "4b058821f964a520b9b322e3",
      description: "Vegetarian, indian food, full of flavour  ",
      type: 'AFFORDABLE'
    }

];


function ViewModel() {
    var self = this;
    //COLLECTION. HOLDS THE ARRAY OF MARKERS

    self.markers = ko.observableArray([]);


    //ADDS STYLINGS TO THE MARKERS
    self.makeMarkerIcon = function(markerColor) {
        console.log('making An Icon');
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_pinetree|' + markerColor,
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage; 
    }

    self.defaultIcon = self.makeMarkerIcon('55823a');
    self.highlightedIcon = self.makeMarkerIcon('e8ce17');

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
        })
        //LISTENERS FOR THE MOUSE ACTIONS
        marker.addListener('click', function() {
            self.populateInfoWindow(this, self.largeInfoWindow);
        });
        marker.addListener('mouseover', function() {
        this.setIcon(self.highlightedIcon);
        });
        marker.addListener('mouseout', function() {
        this.setIcon(self.defaultIcon);
        });
        //PUSHES NEW MARKER TO THE MARKERS
        self.markers.push(marker);
        })


    // INFO WINDOW DISPLAYED ON SELECTED MARKERS. CHANGES DYNAMICALLY
    self.largeInfoWindow = new google.maps.InfoWindow();



    self.populateInfoWindow = function(marker, infoWindow) {
        var content = "";
        if (infoWindow.marker != marker) {
            infoWindow.marker = marker;
            // Make AJAX request to FourSquare API
            $.ajax({
              type: 'GET',
              url: 'https://api.foursquare.com/v2/venues/' + marker.venue_id,
              data: {
                client_id: keys.fourSquare.client_id,
                client_secret: 'HIMK4V53L5IXIB0HVREBO04JN5UQU0R55WZLOSMPLA33DAJM',
                v: '20170801'
            },
              success: function(data, textStats, XMLHttpRequest) {
                try {
                  content += data['response']['venue']['location']['formattedAddress'];
                  content += '<p>' + data['response']['venue']['url'] + '</p>';
                  content += '<p>' +data['response']['venue']['price']['message'] + '</p>';
                  content += '<p>' + data['response']['venue']['contact']['formattedPhone'] + '</p>'; 
                  content += data['response']['venue']['rating'];
                } catch (err) {
                  content = "Oh, no!!! Unable to get info at the moment!";
                }
                infoWindow.setContent(content);
                infoWindow.addListener('closeclick', function() {
                  infoWindow.marker = null;
                });
                infoWindow.open(map, marker);
              },
              error: function(){
                alert("Oh No, Your request did not succeed!")
                content += 'Could not retrieve data';
                infoWindow.setContent(content);
                infoWindow.addListener('closeclick', function() {
                  infoWindow.marker = null;
                });
                infoWindow.open(map, marker);
              }
            
            });
        }
    }

    // Call populateInfoWindow and pass in self.largeInfoWindow.
    // Used in the list view in index.html
    self.populateInfoWindowByListClick = function(marker) {
      self.hideMarkers();
      marker.setMap(map);
      marker.filtered(false);
      self.populateInfoWindow(marker, self.largeInfoWindow);
    }

 
    // Display all the markers on the map.
    self.showMarkers = function() {
        self.markers().forEach(function(marker) {
            marker.setMap(map);
            marker.filtered(false);
        });
    }

    // Hide all the markers.
    self.hideMarkers = function() {
        self.markers().forEach(function(marker) {
            marker.setMap(null);
            marker.filtered(true);
        });
    }

    // Filter displayed markers based on user selection.
    self.filterMarkers = function(filterCriteria) {
        self.markers().forEach(function(marker) {
            if (marker.type != filterCriteria) { 
                marker.setMap(null);
                marker.filtered(true);
            } else {
                marker.setMap(map);
                marker.filtered(false);
            }
        });
    }

} // End ViewModel().


// Intialize the google map to display on the page.
function initMap() {
    var edi = {lat: 55.9533, lng: -3.1883};

    var styles = [
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{color: '#86C67C'} 
    ]
  },{
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{color: '#C4BC68'}
    ]
  },{
    featureType: 'water',
    stylers: [
      { color: '#2b7f58' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },
  {
    featureType: 'transit.station.rail',
    stylers: [
      { color: '#4C0000' }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f2ce21' }
      // #f0e400
    ]
  },{
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{color: '#43ba5a'}
    ]
  },{
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#447530'}
    ]
  },{
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#003C64' },
      { lightness: 30 }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#EC8048' },
      { lightness: -25 }
    ]
  }
  ];

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        styles: styles,
        center: edi
    });


//Bind the ViewModel to out page inside of initMap
ko.applyBindings(new ViewModel());
} // End initMap().
