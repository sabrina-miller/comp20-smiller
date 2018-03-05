var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
myUsername = "moCmzCARAL";

var myOptions = {
	zoom: 13, 
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

var map;
var marker;
var infowindow = new google.maps.InfoWindow();

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
	
	// create a new marker
	marker = new google.maps.Marker({
		position: me,
		title: myUsername
	});
	marker.setMap(map);
		
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

	if ("vehicles" in parsedData)
		len = parsedData.vehicles.length;
	else if ("passengers" in parsedData)
		len = parsedData.passengers.length;

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

		thisMarker = new google.maps.Marker({
			position: current,
			title: thisUser,
			icon: iconType
		})
		thisMarker.setMap(map);

		google.maps.event.addListener(thisMarker, 'click', function() {
			infowindow.setContent(thisMarker.title);
			infowindow.open(map, thisMarker);
		});

	}
}
