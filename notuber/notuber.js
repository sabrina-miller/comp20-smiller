var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myUsername = "moCmzCARAL";
var map;
var marker;
var infowindow;
var len;
var parsedData;
var shortest = Infinity;
var notUserType;
var conversion = 0.00062137;

// vehicle username K9m65WRQyh

var myOptions = {
	zoom: 13, 
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

function init() {
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
	sendData();
}

function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			renderMap();
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
	
	myTitle = "Username: " + myUsername + "</br>Nearest " + notUserType + ": " + shortest + " miles away"
	// create a new marker
	marker = new google.maps.Marker({
		position: me,
		title: myTitle
	});
	marker.setMap(map);
		
	infowindow = new google.maps.InfoWindow();
	// open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});
}

function sendData() {
	request = new XMLHttpRequest();
	request.open("POST", "https://jordan-marsh.herokuapp.com/rides", true);

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

		current = new google.maps.LatLng(thisLat, thisLng);
		distance = google.maps.geometry.spherical.computeDistanceBetween(current, me);
		distance = distance * conversion;

		if (distance < shortest)
			shortest = distance;

		marker = new google.maps.Marker({
			position: current,
 			title: "Username: " + thisUser + "</br>Distance: " + distance + " miles away",
			icon: iconType
		});
		marker.setMap(map);

		infowindow = new google.maps.InfoWindow();
		// open info window on click of marker
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(this.title);
			infowindow.open(map, this);
		});
	}
}
