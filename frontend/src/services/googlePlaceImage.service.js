const GOOGLE_PLACES_BASE_URL =
  'https://places.googleapis.com/v1/places:searchText';

const imageCache = new Map();

function buildSearchText({ placeName, destination, type }) {
  const typeHint = type === 'restaurant' ? 'restaurant' : 'tourist attraction';

  return [placeName, destination, typeHint].filter(Boolean).join(' ');
}

export async function getGooglePlaceImage({
  placeName,
  destination,
  type = 'activity',
  maxWidthPx = 900,
}) {
  console.log('TEST', placeName, destination);
  const textQuery = buildSearchText({ placeName, destination, type });
  const cacheKey = `${textQuery}|${maxWidthPx}`.toLowerCase();

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  console.log('PLACES', placeName, destination);

  const response = await fetch(GOOGLE_PLACES_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.photos',
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places search failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  const place = data.places?.[0];

  if (!place || !place.photos?.length) {
    imageCache.set(cacheKey, null);
    return null;
  }

  const photoName = place.photos[0].name;

  const image = {
    placeId: place.id,
    placeName: place.displayName?.text || placeName,
    address: place.formattedAddress,
    rating: place.rating || null,
    imageUrl: `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    source: 'google',
  };

  imageCache.set(cacheKey, image);

  return image;
}
