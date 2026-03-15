export async function geocodeLGA(lga, state) {
  const query = `${lga}, ${state}, Nigeria`;
  // Use Nominatim (OpenStreetMap) Geocoding API
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        // Nominatim requests a User-Agent to prevent abuse
        'User-Agent': 'INGEC-Platform/1.0'
      }
    });
    const data = await res.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
  }
  return { latitude: null, longitude: null };
}
