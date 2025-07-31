mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11", // Ensure style is set
  center: listing.geometry.coordinates,
  zoom: 9
});

const popup = new mapboxgl.Popup({ offset: 25 })
  .setHTML(`<h3>${listing.title}</h3><p>Get exact location after booking</p>`);

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates) 
  .setPopup(popup)
  .addTo(map);
