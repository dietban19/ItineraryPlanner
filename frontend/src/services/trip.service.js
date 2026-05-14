const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = (token, withBody = false) => ({
  Authorization: `Bearer ${token}`,
  ...(withBody && { 'Content-Type': 'application/json' }),
});

export const fetchUserTrips = async (token) => {
  const res = await fetch(`${API_URL}/trips`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
};

export const createTrip = async (token, tripData) => {
  const res = await fetch(`${API_URL}/trips`, {
    method: 'POST',
    headers: authHeaders(token, true),
    body: JSON.stringify(tripData),
  });
  if (!res.ok) throw new Error('Failed to create trip');
  return res.json();
};

export const saveTrip = async (token, tripId, tripData) => {
  // eslint-disable-next-line no-unused-vars
  const { _id, ...rest } = tripData;
  const res = await fetch(`${API_URL}/trips/${tripId}`, {
    method: 'PUT',
    headers: authHeaders(token, true),
    body: JSON.stringify(rest),
  });
  if (!res.ok) throw new Error('Failed to save trip');
  return res.json();
};

export const deleteTrip = async (token, tripId) => {
  const res = await fetch(`${API_URL}/trips/${tripId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete trip');
};

export const lookupTripByCode = async (token, code) => {
  const res = await fetch(
    `${API_URL}/trips/code/${encodeURIComponent(code.toUpperCase().trim())}`,
    { headers: authHeaders(token) },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to lookup trip');
  return res.json();
};

export const joinTripByCode = async (token, code) => {
  const trip = await lookupTripByCode(token, code);
  if (!trip) throw new Error('not_found');
  const res = await fetch(`${API_URL}/trips/${trip._id}/join`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (res.status === 409) throw new Error('already_member');
  if (!res.ok) throw new Error('Failed to join trip');
  return (await res.json())._id;
};

export const ensureShareCode = async (token, tripId) => {
  const res = await fetch(`${API_URL}/trips/${tripId}/share-code`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to ensure share code');
  const data = await res.json();
  return data.shareCode;
};