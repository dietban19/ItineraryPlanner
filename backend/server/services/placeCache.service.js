import PlaceCache from '../models/PlaceCache.js';

export async function persistPlaceImage(place) {
  if (!place?.placeId) return;

  // already cached — same logic as your firebase snap.exists() check
  const existing = await PlaceCache.findOne({ placeId: place.placeId });
  if (existing) return;

  await PlaceCache.create({
    placeId: place.placeId,
    name: place.name ?? null,
    address: place.address ?? null,
    rating: place.rating ?? null,
    type: place.type ?? 'activity',
    imageUrl: place.image ?? null,
    cachedAt: new Date(),
    details: null,
    detailsCachedAt: null,
  });
}

export async function readCachedDetails(placeId) {
  try {
    const cacheEntry = await PlaceCache.findOne({ placeId });
    if (!cacheEntry || !cacheEntry.details || !cacheEntry.detailsCachedAt)
      return null;
    const age = Date.now() - new Date(cacheEntry.detailsCachedAt).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) return null; // stale if older than 7 days
    return cacheEntry.details;
  } catch {
    return null;
  }
}
