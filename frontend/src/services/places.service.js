import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// Session-level caches to avoid redundant backend (and Google API) calls
const destinationImageCache = new Map();
const placesSearchCache = new Map();

// ── Firestore place cache ─────────────────────────────────────────────────────
// Collection: placesCache/{placeId}
// Stores image URL + basic info on first search, and full details with TTL.

const DETAILS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function placeRef(placeId) {
  return doc(db, 'placesCache', placeId);
}

// Save basic place data (image URL, name, rating…) if not already in Firestore.
// Fire-and-forget — never awaited so it never blocks the UI.
// async function persistPlaceImage(place) {
//   if (!place?.placeId) return;
//   try {
//     const ref = placeRef(place.placeId);
//     const snap = await getDoc(ref);
//     if (snap.exists()) return; // already cached
//     await setDoc(ref, {
//       placeId: place.placeId,
//       name: place.name ?? null,
//       address: place.address ?? null,
//       rating: place.rating ?? null,
//       type: place.type ?? 'activity',
//       imageUrl: place.image ?? null,
//       cachedAt: Timestamp.now(),
//       details: null,
//       detailsCachedAt: null,
//     });
//   } catch {
//     // silently ignore — caching is best-effort
//   }
// }
export async function persistPlaceImage(place) {
  if (!place?.placeId) return;

  try {
    await fetch(`${API_BASE}/place-cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(place),
    });
  } catch {
    // silently ignore — caching is best-effort
  }
}

// // Read full details from Firestore. Returns null if missing or stale (> 7 days).
// async function readCachedDetails(placeId) {
//   try {
//     const snap = await getDoc(placeRef(placeId));
//     if (!snap.exists()) return null;
//     const data = snap.data();
//     if (!data.details || !data.detailsCachedAt) return null;
//     const age = Date.now() - data.detailsCachedAt.toMillis();
//     if (age > DETAILS_CACHE_TTL_MS) return null;
//     return data.details;
//   } catch {
//     return null;
//   }
// }
// Read full details from Firestore. Returns null if missing or stale (> 7 days).
async function readCachedDetails(placeId) {
  console.log('READING CACHED DETAILS');
  try {
    const response = await fetch(`${API_BASE}/place-cache/details`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.details ?? null;
  } catch {
    return null;
  }
}

// Save full details into the existing (or new) Firestore document.
// Fire-and-forget.
async function persistDetails(placeId, details) {
  if (!placeId || !details) return;
  try {
    await setDoc(
      placeRef(placeId),
      { details, detailsCachedAt: Timestamp.now() },
      { merge: true },
    );
  } catch {
    // silently ignore
  }
}

/**
 * Fetch a single representative image URL for a destination.
 * Returns null if the backend is unavailable or no image found.
 *
 * @param {string} destination - e.g. "Paris, France"
 * @returns {Promise<string | null>}
 */
export async function fetchDestinationImage(destination) {
  if (destinationImageCache.has(destination)) {
    return destinationImageCache.get(destination);
  }

  try {
    const url = new URL(`${API_BASE}/place-image`);
    url.searchParams.set('destination', destination);
    url.searchParams.set('type', 'destination');

    const res = await fetch(url.toString());
    if (!res.ok) {
      destinationImageCache.set(destination, null);
      return null;
    }

    const data = await res.json();
    const imageUrl = data.image?.imageUrl ?? null;
    destinationImageCache.set(destination, imageUrl);
    return imageUrl;
  } catch {
    destinationImageCache.set(destination, null);
    return null;
  }
}

/**
 * Search for places (activities or restaurants) near a destination.
 *
 * @param {{ query?: string, destination: string, type?: 'activity' | 'restaurant', maxResults?: number }} opts
 * @returns {Promise<Array<{ placeId, name, address, rating, type, image }>>}
 */
export async function searchPlaces({
  query = '',
  destination,
  type = 'activity',
  maxResults = 8,
}) {
  console.log('Searching places');
  const cacheKey =
    `${query}|${destination}|${type}|${maxResults}`.toLowerCase();
  console.log('CACHE KEY: ', cacheKey);
  console.log(placesSearchCache);

  if (placesSearchCache.has(cacheKey)) {
    console.log('IS THE KEY IN THE CACHE, yes');
    return placesSearchCache.get(cacheKey);
  }

  const url = new URL(`${API_BASE}/places/search`);
  if (query) url.searchParams.set('query', query);
  url.searchParams.set('destination', destination);
  url.searchParams.set('type', type);
  url.searchParams.set('maxResults', String(maxResults));
  console.log('URL ', url);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to search places');

  const data = await res.json();
  console.log('DATA: ', data);
  const places = data.places ?? [];
  console.log('Places: ', places);
  placesSearchCache.set(cacheKey, places);

  // Persist each place's image URL to Firestore (fire-and-forget).
  // On subsequent visits the URL is already cached and no extra call is needed.
  places.forEach((p) => persistPlaceImage(p));

  return places;
}

/**
 * Fetch full details (reviews, photos, hours) for a single place.
 *
 * @param {string} placeId
 * @returns {Promise<object | null>}
 */
export async function getPlaceDetails(placeId) {
  console.log('GETTING PLACE DETAILS: ', placeId);
  // 1. Check Firestore — skip the backend call entirely if we have a fresh copy.
  const cached = await readCachedDetails(placeId);
  if (cached) return cached;

  // 2. Fetch from backend → Google Places API.
  const url = new URL(`${API_BASE}/places/details`);
  url.searchParams.set('placeId', placeId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch place details');
  const data = await res.json();
  const details = data.details ?? null;

  // 3. Persist to Firestore so the next call is free (fire-and-forget).
  persistDetails(placeId, details);

  return details;
}

// Session-level cache — weather changes slowly, no need to re-fetch on every render
const weatherCache = new Map();
// Session-level cache — prayer times only change daily
const prayerCache = new Map();

/**
 * Fetch current weather for a destination from the backend (Open-Meteo via Google Places coords).
 *
 * @param {string} destination - e.g. "Calgary, Canada"
 * @returns {Promise<{ code, temperature, apparentTemperature, high, low, windSpeed } | null>}
 */
export async function getWeather(destination) {
  if (!destination) return null;

  const key = destination.toLowerCase().trim();
  if (weatherCache.has(key)) return weatherCache.get(key);

  try {
    const url = new URL(`${API_BASE}/weather`);
    url.searchParams.set('destination', destination);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    const weather = data.weather ?? null;
    weatherCache.set(key, weather);
    return weather;
  } catch {
    return null;
  }
}

/**
 * Fetch today's prayer times for a destination from the backend (Aladhan API).
 *
 * @param {string} destination - e.g. "Calgary, Canada"
 * @param {number} [method=2]  - Aladhan calculation method
 * @returns {Promise<{ timings: object, date: object, meta: object } | null>}
 */
export async function getPrayerTimes(destination, method = 2) {
  if (!destination) return null;

  const key = `${destination.toLowerCase().trim()}:${method}`;
  if (prayerCache.has(key)) return prayerCache.get(key);

  try {
    const url = new URL(`${API_BASE}/prayer-times`);
    url.searchParams.set('destination', destination);
    url.searchParams.set('method', method);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    const prayerTimes = data.prayerTimes ?? null;
    prayerCache.set(key, prayerTimes);
    return prayerTimes;
  } catch {
    return null;
  }
}
