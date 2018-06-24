// TODO:
// Antioch, Jerusalem, Rome stars

$("#sidebar").toggle(); //toggling this before and after map creation sets a larger map size for smooth animated transitions

mapboxgl.accessToken =
	"pk.eyJ1IjoiYmlibGV2aXoiLCJhIjoiY2pjOTVhazJ1MDlqbzMzczFoamd3MzFnOSJ9.7k1RJ5oh-LNaYuADxsgx4Q";
var map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/bibleviz/cjh46bcmp2udj2sq5ifg79zkh",
	zoom: 5.3,
	center: [28.976205, 36.434199],
	minZoom: 3,
	maxZoom: 10,
	pitchWithRotate: false,
	dragRotate: false
});

if ($('#content').width()<=1024) {
	map.fitBounds([[21,31], [38, 41]]);
} else {
	map.fitBounds([[22, 30.5], [42, 42]]);
}


$("#sidebar").toggle();

//this guarantees the map will fit with the sidebar if the browser is resized
$(window).resize(function() {
	$("#sidebar").toggle();
	map.resize();
	$("#sidebar").toggle();
});

var nav = new mapboxgl.NavigationControl({ showCompass: false });
map.addControl(nav, "top-right");

var layerControls = $(".layerButton");
layerControls.click(function(e) {
	e.preventDefault();
	e.stopPropagation();
	var route = this.textContent.toLowerCase();
	if ($(this).hasClass("active")) {
		toggleLayers("all");
		map.setFilter("journey-places", [
			"any",
			["has", "first"],
			["has", "second"],
			["has", "third"],
			["has", "rome"]
		]);
		$(this).removeClass("active");
	} else {
		toggleLayers(route);
		map.setFilter("journey-places", ["has", route]);
		layerControls.removeClass("active");
		$(this).addClass("active");
	}
});

function toggleLayers(layerName) {
	layerControls.each(function() {
		var thisLayer = this.textContent.toLowerCase();
		if (layerName === thisLayer || layerName === "all") {
			map.setLayoutProperty(thisLayer + "-journey", "visibility", "visible");
			map.setLayoutProperty(
				thisLayer + "-journey-arrows",
				"visibility",
				"visible"
			);
		} else {
			map.setLayoutProperty(thisLayer + "-journey", "visibility", "none");
			map.setLayoutProperty(thisLayer + "-journey-arrows", "visibility", "none");
		}
	});
}

map.on("click", "journey-places", function(e) {
	var coordinates = e.features[0].geometry.coordinates.slice();
	var name = e.features[0].properties["Place ID"];
	var source = e.features[0].properties["Source Link"];
	var verses = "";
	if (e.features[0].properties.first) {
		verses = verses + verseLinks("First Journey", e.features[0].properties.first);
	}
	if (e.features[0].properties.second) {
		verses =
			verses + verseLinks("Second Journey", e.features[0].properties.second);
	}
	if (e.features[0].properties.third) {
		verses = verses + verseLinks("Third Journey", e.features[0].properties.third);
	}
	if (e.features[0].properties.rome) {
		verses = verses + verseLinks("Rome Journey", e.features[0].properties.rome);
	}
	var note = e.features[0].properties.Notes;

	new mapboxgl.Popup()
		.setLngLat(coordinates)
		.setHTML(
			'<div class="tooltip"><div class="t-name">' +
				name +
				"</div>" +
				verses +
				'<div class="note">' +
				note +
				"</div>" +
				'More: <a class="t-link" href=' +
				source +
				' target="_blank">' +
				source.replace("http://", "") +
				"</a>" +
				"</div>"
		)
		.addTo(map);
});

function verseLinks(route, props) {
	//split and build for all verses in list
	var verses = props.split(",");
	var verseLinks = verses.map(function(verse) {
		console.log(verse);
		var bcv = verse.split(".");
		verse =
			'<a class="t-link" href=" https://www.blueletterbible.org/kjv/act/' +
			bcv[1] +
			"/" +
			bcv[2] +
			'" target="_blank">' +
			bcv[0] +
			" " +
			bcv[1] +
			":" +
			bcv[2] +
			"</a>";
		return verse;
	});
	return (
		'<div class="t-verses">' + route + ": " + verseLinks.join(", ") + "</div>"
	);
}

map.on("mouseenter", "journey-places", function(e) {
	map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "journey-places", function(e) {
	map.getCanvas().style.cursor = "";
});

$("#more").on("click", function() {
	$("#sidebar, #side-text, #open-close, #more-label, #more, #map").toggleClass(
		"collapsed"
	);
});