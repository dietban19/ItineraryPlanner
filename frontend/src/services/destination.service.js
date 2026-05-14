// Session-level cache to avoid repeated Geoapify calls for the same query
const destinationCache = new Map();

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export function clearDestinationCache() {
  destinationCache.clear();
}

export async function searchDestinations(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (destinationCache.has(cleanQuery.toLowerCase())) {
    return destinationCache.get(cleanQuery.toLowerCase());
  }

  const url = new URL(`${API_BASE}/geocode/autocomplete`);
  url.searchParams.set('text', cleanQuery);
  url.searchParams.set('limit', '8');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to search destinations');
  }

  const data = await response.json();

  const mapped = (data.results || []).map((place) => ({
    id: place.place_id,
    city: place.city || place.name || place.address_line1,
    country: place.country,
    region: place.state,
    label: place.formatted,
    latitude: place.lat,
    longitude: place.lon,
  }));

  destinationCache.set(cleanQuery.toLowerCase(), mapped);
  return mapped;
}
