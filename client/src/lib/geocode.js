import { GOOGLE_MAPS_KEY } from './maps';

export async function geocodeLGA(lga, state) {
  const query = `${lga}, ${state}, Nigeria`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
  }
  return { latitude: null, longitude: null };
}
