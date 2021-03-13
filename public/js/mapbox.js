/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXlhbmx1YXAiLCJhIjoiY2tsejlldDBlMWJsejJ2bzZ2NDhuM3UycyJ9.DnUBB3S3j86FbRYUWCTsSQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ayanluap/ckm3hrkir11op17lh0ejfm1gk',
  scrollZoom: false,
  // center: [-118.113, 34.111], // [lng, lat] ---FORMAT
  // zoom: 4,
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create Marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add Marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add Popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extends the map bounds to include current loc.
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

// console.log(locations);
