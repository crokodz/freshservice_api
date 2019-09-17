!(function($) {
    var clientAPP = null,
        targetContainer = "#renderOutput ul",
        $li,
        $label,
        $value;
    initModal = function(_client) {
        clientAPP = _client;
        getData();
    };

    flattenToString = function(_v) {
        var swapVariable = "";
        if (typeof _v == "string") {
            _v = _v.trim();
        } else if (Array.isArray(_v)) {
            _v = _v.join(",");
        } else if (typeof _v == "object") {
            swapVariable += "<div class='nested'>" + JSON.stringify(_v) + "</div>";
            _v = swapVariable;
        }
        if (_v == null || _v == "") {
            _v = "-";
        }
        return _v;
    };

    getData = function() {
        var $targetContainer = $(targetContainer);
        $(targetContainer).empty();
        clientAPP.data.get("recentChildTickets")
            .then(
                function(data) {
                    if (data["recentChildTickets"].length) {
                        $.each(data["recentChildTickets"][0], function(_k, _v) {
                            $label = $("<label>");
                            $label.html(_k).addClass("info");
                            $value = $("<label>");
                            $value.html(flattenToString(_v)).addClass("value");
                            $li = $("<li class='clearfix'>");
                            $li.append($label).append($value);
                            $targetContainer.append($li);
                        });
                    }
                },
                function(error) {
                    clientAPP.instance.send({
                        message: {
                            note: 'Error was: ' + error, 
                            type: 'notify'
                        }
                    });
                }
            );
    };

    $("#addToNotes").on("click", function() {
        data = clientAPP.data.get("ticket")
            .then(function() {
                var outputDiv = document.getElementById('output');
                clientAPP.instance.send({
                    message: {
                        note: outputDiv.innerHTML,
                        type: 'note'
                    }
                });
                clientAPP.instance.close();
        });
    });

    setLocation = function(map, origin, destination, marker1, marker2){
        var bounds = new google.maps.LatLngBounds;
        marker1.setPosition(origin);
        marker2.setPosition(destination);
        var geocoder = new google.maps.Geocoder;
        var service = new google.maps.DistanceMatrixService;    
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function(response, status) {
            if (status !== 'OK') {
                clientAPP.instance.send({
                    message: {
                        note: 'Error was: ' + status, 
                        type: 'notify'
                    }
                });
            } else {
                var originList = response.originAddresses;
                var destinationList = response.destinationAddresses;
                var outputDiv = document.getElementById('output');
                outputDiv.innerHTML = '';

                var showGeocodedAddressOnMap = function() {
                    return function(results, status) {
                        if (status === 'OK') {
                            map.fitBounds(bounds.extend(results[0].geometry.location));
                        } else {
                            clientAPP.instance.send({
                                message: {
                                    note: 'Geocode was not successful due to: ' + status, 
                                    type: 'notify'
                                }
                            });
                        }
                    };
                };

                for (var i = 0; i < originList.length; i++) {
                    var results = response.rows[i].elements;
                    geocoder.geocode({'address': originList[i]},
                    showGeocodedAddressOnMap(false));
                    for (var j = 0; j < results.length; j++) {
                        if (results[j].status == 'ZERO_RESULTS') {
                            outputDiv.innerHTML += '<span style="font-size: 15px;font-weight:bold;color:red">Route not found.</span>';
                        } else {
                            geocoder.geocode({'address': destinationList[j]},
                            showGeocodedAddressOnMap(true));
                            outputDiv.innerHTML += 'From: ' + originList[i] + '<br>To: ' + destinationList[j] +
                            '<br    ><span style="font-size: 15px;font-weight:bold">' + results[j].distance.text + ' in ' +
                            results[j].duration.text + '</span><br>';
                        }
                    }
                }
            }
        });
    };

    initMap = function () {
        var originLat = parseFloat(localStorage.getItem("originLat"));
        var originLng = parseFloat(localStorage.getItem("originLng"));

        var destinationLat = parseFloat(localStorage.getItem("destinationLat"));
        var destinationLng = parseFloat(localStorage.getItem("destinationLng"));

        var olat = originLat ? originLat : -33.8644254;
        var olng = originLng ? originLng : 151.2058243;

        var dlat = destinationLat ? destinationLat : -33.8740641;
        var dlng = destinationLng ? destinationLng : 151.2080774;

        var origin = {lat: olat, lng: olng};
        var destination = {lat: dlat, lng: dlng};
        var map = new google.maps.Map(document.getElementById('map'), {
          center: origin,
          zoom: 15
        });

        var marker1 = new google.maps.Marker({
          position: origin,
          map: map
        });

        var marker2 = new google.maps.Marker({
          position: destination,
          map: map
        });

        map.addListener('rightclick', function (event) {
            destination = event.latLng;
            localStorage.setItem("destinationLat", destination.lat());
            localStorage.setItem("destinationLng", destination.lng());
            setLocation(map, origin, event.latLng, marker1, marker2);
        });

        map.addListener('click', function (event) {
            origin = event.latLng;
            localStorage.setItem("originLat", origin.lat());
            localStorage.setItem("originLng", origin.lng());
            setLocation(map, event.latLng, destination, marker1, marker2);
        });

        setLocation(map, origin, destination, marker1, marker2);
    };

    $(document).ready(function() {
        app.initialized().then(
            initModal
            ,
            function(error) {
                clientAPP.instance.send({
                    message: {
                        note: 'Error was: ' + error, 
                        type: 'notify'
                    }
                });
            }
        );
        localStorage.removeItem("originLat");
        localStorage.removeItem("destinationLat");
        localStorage.removeItem("originLng");
        localStorage.removeItem("destinationLng");
    });
})(window.jQuery);

