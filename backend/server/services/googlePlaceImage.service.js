import PlaceCache from '../models/PlaceCache.js';
import ApiLog from '../models/ApiLog.js';
import { readCachedDetails, persistDetails } from './placeCache.service.js';

async function logApiCall(apiName) {
  await ApiLog.findOneAndUpdate(
    { apiName },
    { $push: { calls: { calledAt: new Date() } } },
    { upsert: true },
  );
}

const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

// In-memory cache with TTL to avoid redundant (billable) Google API calls
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const placeCache = new Map();

function cacheGet(key) {
  const entry = placeCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    placeCache.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet(key, value) {
  placeCache.set(key, { value, ts: Date.now() });
}

// Resolves a Google photo reference to its final CDN URL (lh3.googleusercontent.com).
// The /media endpoint responds with a 302 redirect — following it server-side avoids
// exposing the API key to browsers and prevents intermittent load failures.
async function resolvePhotoUrl(photoName, maxWidthPx) {
  console.log('RESOLVE PHOTO URL');
  const apiUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  try {
    await logApiCall('resolvePhotoUrl');
    const res = await fetch(apiUrl, { redirect: 'manual' });
    const location = res.headers.get('location');
    if (location) return location;
  } catch {
    // fall through and return the raw API URL as a last resort
  }
  return apiUrl;
}

function detectType(place) {
  const t = (place.primaryType ?? '').toLowerCase();
  if (
    t.includes('restaurant') ||
    t.includes('food') ||
    t.includes('cafe') ||
    t.includes('bar') ||
    t.includes('bakery')
  ) {
    return 'restaurant';
  }
  return 'activity';
}

/**
 * Fetch a single place image for a destination or activity.
 *
 * @param {{ placeName?: string, destination?: string, type?: string, maxWidthPx?: number }} opts
 * @returns {Promise<{ placeId, placeName, address, rating, imageUrl, source } | null>}
 */
export async function getGooglePlaceImage({
  placeName,
  destination,
  type = 'activity',
  maxWidthPx = 900,
}) {
  const typeHint =
    type === 'restaurant'
      ? 'restaurant'
      : type === 'destination'
        ? ''
        : 'tourist attraction';

  const parts = [placeName, destination, typeHint].filter(Boolean);
  const textQuery = parts.join(' ');

  const cacheKey = `img|${textQuery}|${maxWidthPx}`.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  await logApiCall('getGooglePlaceImage:searchText');
  const response = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.photos',
    },
    body: JSON.stringify({ textQuery, maxResultCount: 1 }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const place = data.places?.[0];

  if (!place || !place.photos?.length) {
    cacheSet(cacheKey, null);
    return null;
  }

  const result = {
    placeId: place.id,
    placeName: place.displayName?.text ?? placeName ?? destination,
    address: place.formattedAddress ?? null,
    rating: place.rating ?? null,
    // imageUrl: await resolvePhotoUrl(place.photos[0].name, maxWidthPx),
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/960px-Solid_red.svg.png',
    source: 'google',
  };
  cacheSet(cacheKey, result);
  return result;
}

/**
 * Search for multiple places in a destination.
 *
 * @param {{ query?: string, destination?: string, type?: string, maxResults?: number, maxWidthPx?: number }} opts
 * @returns {Promise<Array<{ placeId, name, address, rating, type, image }>>}
 */
export async function searchGooglePlaces({
  query = '',
  destination = '',
  type = 'activity',
  maxResults = 8,
  maxWidthPx = 600,
}) {
  // Cap maxResults to limit API usage and cost
  const safeMaxResults = Math.min(maxResults, 10);

  const typeHint =
    type === 'restaurant' ? 'restaurants' : 'tourist attractions things to do';

  const textQuery = query
    ? `${query} ${destination}`.trim()
    : `${typeHint} in ${destination}`.trim();

  const cacheKey =
    `search|${textQuery}|${safeMaxResults}|${maxWidthPx}`.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  await logApiCall('searchGooglePlaces:searchText');
  const response = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.primaryType',
    },
    body: JSON.stringify({ textQuery, maxResultCount: safeMaxResults }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const places = data.places ?? [];
  const placeIds = places.map((p) => p.id);
  const cachedDocs = await PlaceCache.find(
    { placeId: { $in: placeIds }, imageUrl: { $ne: null } },
    { placeId: 1, imageUrl: 1 },
  ).lean();
  const cachedImageMap = new Map(
    cachedDocs.map((d) => [d.placeId, d.imageUrl]),
  );
  const results = await Promise.all(
    places
      .filter((p) => p.photos?.length)
      .map(async (place) => {
        const cachedImage = cachedImageMap.get(place.id);
        const image = cachedImage
          ? cachedImage
          : await resolvePhotoUrl(place.photos[0].name, maxWidthPx);
        // 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Green_dark_square.jpg/250px-Green_dark_square.jpg';
        // Persist the image URL to Firestore for future cache hits (fire-and-forget)
        return {
          placeId: place.id,
          name: place.displayName?.text ?? '',
          address: place.formattedAddress ?? null,
          rating: place.rating ?? null,
          type: detectType(place),
          // image: await resolvePhotoUrl(place.photos[0].name, maxWidthPx),
          image,
        };
      }),
  );

  cacheSet(cacheKey, results);
  return results;
}

/**
 * Fetch full details for a single place by placeId.
 *
 * @param {{ placeId: string, maxWidthPx?: number }} opts
 * @returns {Promise<object | null>}
 */
export async function getGooglePlaceDetails({ placeId, maxWidthPx = 900 }) {
  const cacheKey = `details|${placeId}`.toLowerCase();

  // 1. In-memory cache (fastest)
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  // 2. MongoDB cache — includes previously resolved photo URLs
  const dbCached = await readCachedDetails(placeId);
  if (dbCached) {
    cacheSet(cacheKey, dbCached);
    return dbCached;
  }

  await logApiCall('getGooglePlaceDetails:placeDetails');
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,rating,userRatingCount,reviews,photos,currentOpeningHours,regularOpeningHours,priceLevel,websiteUri,nationalPhoneNumber,editorialSummary',
      },
    },
  );

  if (!response.ok) {
    cacheSet(cacheKey, null);
    return null;
  }

  const place = await response.json();
  const result = {
    placeId: place.id,
    name: place.displayName?.text ?? '',
    address: place.formattedAddress ?? null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    isOpen: place.currentOpeningHours?.openNow ?? null,
    description: place.editorialSummary?.text ?? null,
    website: place.websiteUri ?? null,
    phone: place.nationalPhoneNumber ?? null,
    hours: place.regularOpeningHours?.weekdayDescriptions ?? null,
    photos: await Promise.all(
      (place.photos ?? [])
        .slice(0, 5)
        // .map((p) => resolvePhotoUrl(p.name, maxWidthPx)),
        .map((p) => resolvePhotoUrl(p.name, maxWidthPx)),
    ),
    reviews: (place.reviews ?? []).slice(0, 5).map((r) => ({
      author: r.authorAttribution?.displayName ?? 'Anonymous',
      rating: r.rating ?? null,
      text: r.text?.text ?? '',
      time: r.relativePublishTimeDescription ?? '',
    })),
  };
  cacheSet(cacheKey, result);

  // Persist to MongoDB — resolved photo URLs survive server restarts (fire-and-forget)
  persistDetails(placeId, result);

  return result;
}
