import PlaceCache from '../models/PlaceCache.js';

export async function persistPlaceImage(place) {
  if (!place?.placeId) return;

  await PlaceCache.findOneAndUpdate(
    { placeId: place.placeId },
    {
      $setOnInsert: {
        placeId: place.placeId,
        name: place.name ?? null,
        address: place.address ?? null,
        rating: place.rating ?? null,
        type: place.type ?? 'activity',
        imageUrl: place.image ?? null,
        cachedAt: new Date(),
        details: null,
        detailsCachedAt: null,
      },
    },
    { upsert: true },
  );
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

export async function persistDetails(placeId, details) {
  if (!placeId || !details) return;
  try {
    await PlaceCache.findOneAndUpdate(
      { placeId },
      { $set: { details, detailsCachedAt: new Date() } },
      { upsert: true },
    );
  } catch {
    // silently ignore — caching is best-effort
  }
}
