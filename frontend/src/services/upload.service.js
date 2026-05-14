import { auth } from '../lib/firebase';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

/**
 * Upload a single image File to Cloudinary via the backend.
 * Requires the user to be authenticated.
 * @param {File} file
 * @returns {Promise<string>} Cloudinary secure URL
 */
export async function uploadImage(file) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');

  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error ?? 'Upload failed');
  }

  const { url } = await res.json();
  return url;
}
