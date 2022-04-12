// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    console.log(data);
    createFeatures(data.features);
});
function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place, time and magnitude of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3><b>Location:</b> ${feature.properties.place}</h3><hr><p><b>Date & Time:</b> ${
            new Date(feature.properties.time)}<hr><b>Magnitude:</b> ${feature.properties.mag}<hr><b>Depth:</b> ${feature.geometry.coordinates[2]} Km</p>`);
    }

    function chooseColor(depth) {
        if (depth >= -10 && depth < 10) return "#52fd06"
        else if (depth >= 10 && depth < 30) return "#a2dc00";
        else if (depth >= 30 && depth < 50) return "#cfb800";
        else if (depth >= 50 && depth < 70) return "#ec8f00";
        else if (depth >= 70 && depth < 90) return "#fc5e00";
        else return "#ff0819";
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                color: "#000",
                weight: 1,
                radius: 4*(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
        	    fillOpacity: 0.7
            });
        },
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}
function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    let Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    // Create the baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo,
        "ESRI World Imagery": Esri_WorldImagery
    };
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [32.7832, -104.5085],
        zoom: 4,
        layers: [street, earthquakes]
    });
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend.

    function getColor(category) {
        if (category == '-10 to 10 Km') return "#52fd06"
        else if (category == '10 to 30 Km') return "#a2dc00";
        else if (category == '30 to 50 Km') return "#cfb800";
        else if (category == '50 to 70 Km') return "#ec8f00";
        else if (category == '70 to 90 Km') return "#fc5e00";
        else return "#ff0819";
    }

    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        let labels = [`<strong>Depth of Earthquake</strong>`];
        let categories = ['-10 to 10 Km','10 to 30 Km','30 to 50 Km','50 to 70 Km','70 to 90 Km','Over 90 Km'];

        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += 
            labels.push(
                '<i style="background:' + getColor(categories[i]) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}
