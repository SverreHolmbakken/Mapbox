import { accessToken } from "../../../env.js";
import fetchStations from "./fetchStations.js";

export default async function mapbox() {
	const center = [10.752245, 59.913868];
	const startZoom = 13;
	
	mapboxgl.accessToken = accessToken;

	const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v12',
	// cooperativeGestures: true,
	center: center,
	zoom: startZoom
	});

	const allStations = await fetchStations();
	console.log(allStations)

	allStations.features.forEach(spot => {
		const markerElement = document.createElement('div');
		markerElement.classList.add('marker');
	
		const popup = new mapboxgl.Popup({ offset: 25 }).setText(
			spot.properties.message
		);
		
		new mapboxgl.Marker(markerElement)
			.setLngLat(spot.geometry.coordinates)
			.setPopup(popup)
			.addTo(map);
	
	
		markerElement.addEventListener('click', () => {
			// Fly to the location of the pin
			map.flyTo({
			center: spot.geometry.coordinates,
			zoom: 16,
			essential: true 
			});
		});
	});
	
	
	map.addControl(new mapboxgl.FullscreenControl());
	
	map.addControl(
		new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			mapboxgl: mapboxgl
		}),
		'top-left'
	);
		
	map.addControl(new mapboxgl.NavigationControl());
	
	map.addControl(
		new mapboxgl.GeolocateControl({
		positionOptions: {
		enableHighAccuracy: true
		},
		// When active the map will receive updates to the device's location as it changes.
		trackUserLocation: true,
		// Draw an arrow next to the location dot to indicate which direction the device is heading.
		showUserHeading: false
		})
	);
	
	
	
	map.addControl(
	new MapboxDirections({
		accessToken: mapboxgl.accessToken,
		useMetricSystems: true
		}),
		'top-left'
	);
}