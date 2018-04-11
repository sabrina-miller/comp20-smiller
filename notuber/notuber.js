var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myUsername = "moCmzCARAL";
var map;

// marker variables
var marker;
var myMarker;

var infowindow = new google.maps.InfoWindow();

var len;
var parsedData;
var shortest = -1;
var displayDistance = "N/A";
var notUserType;
var conversion = 0.00062137; // miles per meter

var myOptions = {
	zoom: 13, 
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

// overall function to run when page loads 
function init() {
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
}

function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;

			// execute functions in this order so variables are set in the correct order
			// for proper access
			renderMap();
			sendData();
		});
	}
	else {
		alert("Geolocation is not supported by your web browser");
	}
}

function renderMap() {
	me = new google.maps.LatLng(myLat, myLng);

	// update map and go there
	map.panTo(me);
	
	// create a new marker
	myMarker = new google.maps.Marker({
		position: me,
	});
	myMarker.setMap(map);
}

function sendData() {
	request = new XMLHttpRequest();
	request.open("POST", "https://fast-gorge-76938.herokuapp.com/rides", true);

	// once data is done being received and status is 200, get data and 
	// parse it
	request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				myData = request.responseText;				
				parsedData = JSON.parse(myData);
				placeMarkers();
			}
		};

	// send HTTP response header with username, lat, lng
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	header = "username=" + myUsername + "&lat=" + myLat + "&lng=" + myLng;
	request.send(header);
}

function placeMarkers() {
	// set length based on if passenger or vehicle
	if ("vehicles" in parsedData) {
		len = parsedData.vehicles.length;
		notUserType = "vehicle";
	}
	else if ("passengers" in parsedData) {
		len = parsedData.passengers.length;
		notUserType = "passenger";
	}

	for (count = 0; count < len; count++) {
		if ("vehicles" in parsedData) {
			thisLat = parsedData.vehicles[count].lat;
			thisLng = parsedData.vehicles[count].lng;
			thisUser = parsedData.vehicles[count].username;
			iconType = "car.png";
		}
		else if ("passengers" in parsedData) {
			thisLat = parsedData.passengers[count].lat;
			thisLng = parsedData.passengers[count].lng;
			thisUser = parsedData.passengers[count].username;
			iconType = "dude.png";
		}

		// calculate distance between current point and me, convert to miles,
		// change precision on that number for nicer interface
		current = new google.maps.LatLng(thisLat, thisLng);
		distance = google.maps.geometry.spherical.computeDistanceBetween(me, current);
		distance = distance * conversion;
		distance = distance.toPrecision(4);

		if (count == 0)
			shortest = distance;
		// update shortest distance if applicable
		else if (distance < shortest)
			shortest = distance;

		// create new marker for current vehicle/passenger object
		marker = new google.maps.Marker({
			position: current,
 			title: "Username: " + thisUser + "</br>Distance: " + distance + " miles away",
			icon: iconType
		});
		marker.setMap(map);

		// open info window on click of marker
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(this.title);
			infowindow.open(map, this);
		});
	}

	if (shortest != -1)
		displayDistance = shortest;

	myTitle = "Username: " + myUsername + "</br>Nearest " + notUserType + ": " + displayDistance + " miles away";

	// open info window on click of marker
	google.maps.event.addListener(myMarker, 'click', function() {
		infowindow.setContent(myTitle);
		infowindow.open(map, myMarker);
	});

}
