const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// In-memory caches with TTL
const COORDS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — coordinates don't change
const WEATHER_TTL_MS = 30 * 60 * 1000; // 30 minutes

const coordsCache = new Map();
const weatherCache = new Map();

function cacheGet(map, key, ttl) {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > ttl) {
    map.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet(map, key, value) {
  map.set(key, { value, ts: Date.now() });
}

/**
 * Resolve lat/lng for a destination string via Google Places searchText.
 * @param {string} destination
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
async function getCoordinates(destination) {
  const key = destination.toLowerCase().trim();
  const cached = cacheGet(coordsCache, key, COORDS_TTL_MS);
  if (cached !== undefined) return cached;

  const response = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'places.location',
    },
    body: JSON.stringify({ textQuery: destination, maxResultCount: 1 }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const loc = data.places?.[0]?.location;

  if (!loc?.latitude || !loc?.longitude) {
    throw new Error(`Could not resolve coordinates for: ${destination}`);
  }

  const coords = { latitude: loc.latitude, longitude: loc.longitude };
  cacheSet(coordsCache, key, coords);
  return coords;
}

/**
 * Fetch current weather for a destination.
 *
 * @param {string} destination  — free-text destination name (e.g. "Calgary, Canada")
 * @returns {Promise<{
 *   code: number,
 *   temperature: number,
 *   apparentTemperature: number,
 *   high: number,
 *   low: number,
 *   windSpeed: number,
 *   latitude: number,
 *   longitude: number,
 * }>}
 */
export async function getWeatherForDestination(destination) {
  const cacheKey = destination.toLowerCase().trim();
  const cached = cacheGet(weatherCache, cacheKey, WEATHER_TTL_MS);
  if (cached !== undefined) return cached;

  const { latitude, longitude } = await getCoordinates(destination);
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Open-Meteo API error ${response.status}: ${text}`);
  }

  const data = await response.json();

  const result = {
    code: data.current.weather_code,
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    windSpeed: Math.round(data.current.wind_speed_10m),
    latitude,
    longitude,
  };

  cacheSet(weatherCache, cacheKey, result);
  return result;
}
