export default async function fetchStations() {
	const endpointStations = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json';
	const endpointStatus = 'https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json';

	const responses = await Promise.all([
		fetch(endpointStations), 
		fetch(endpointStatus)
	]);

	try {
		return await handleResponses(responses);
	} catch (error) {
		handleError(error);
	}
}

async function handleResponses(responses) {
	if(responses[0].ok && 
		responses[1].ok) {

		const results = await Promise.all(responses.map(response => response.json()));
		console.log(results);
		
		const stationsData = results[0].data.stations.map(station => {
			const avaliability = results[1].data.stations.find(StationID => StationID.station_id === station.station_id);
			return {
				type: 'Feature',
				properties: {
					message: `
						${station.name} - 
						${avaliability.num_bikes_available} /
						${avaliability.num_docks_available + avaliability.num_bikes_available}
					`,
				},
				geometry: {
					type: 'Point',
					coordinates: [station.lon, station.lat]
				}
			}
		});

		return {
			type: 'FeatureCollection',
			features: stationsData
		}

	} else if (
		responses[0].status === 404 ||
		responses[1].status === 404
	) {
		throw new Error('Mislykket URL');
	} else if (
		responses[0].status > 499 ||
		responses[1].status > 499
	) {
		throw new Error('Serverfeil');
	} else {
		throw new Error('Noe gikk galt');
	}
}

function handleError(error) {
	alert(error.message)
}