const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const ALADHAN_URL = 'https://api.aladhan.com/v1/timings';

// In-memory caches with TTL
const COORDS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PRAYER_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — prayer times only change daily

const coordsCache = new Map();
const prayerCache = new Map();

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
 * Fetch today's prayer times for a destination using the Aladhan API.
 *
 * @param {string} destination  — free-text destination name (e.g. "Calgary, Canada")
 * @param {number} [method=2]   — Aladhan calculation method (default: ISNA)
 * @returns {Promise<{ timings: object, date: object, meta: object }>}
 */
export async function getPrayerTimesForDestination(destination, method = 2) {
  const cacheKey = `${destination.toLowerCase().trim()}:${method}`;
  const cached = cacheGet(prayerCache, cacheKey, PRAYER_TTL_MS);
  if (cached !== undefined) return cached;

  const { latitude, longitude } = await getCoordinates(destination);

  const params = new URLSearchParams({
    latitude,
    longitude,
    method,
  });

  const response = await fetch(`${ALADHAN_URL}?${params}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Aladhan API error ${response.status}: ${text}`);
  }

  const json = await response.json();

  if (json.code !== 200 || !json.data) {
    throw new Error(`Aladhan API returned unexpected response: ${json.status}`);
  }

  const result = {
    timings: json.data.timings,
    date: json.data.date,
    meta: json.data.meta,
  };

  cacheSet(prayerCache, cacheKey, result);
  return result;
}
