import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CompleteProfilePage() {
  const { user, userProfile, completeProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // If profile is already completed, send to dashboard
  if (userProfile?.profileCompleted) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!birthday) {
      setError('Please enter your birthday.');
      return;
    }

    setLoading(true);
    try {
      await completeProfile({
        displayName: displayName.trim(),
        birthday,
        photoFile: photoFile ?? null,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-stone-50 px-6 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-stone-900 font-display">
          Set up your profile
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Just a few more details before you start exploring
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Avatar picker */}
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center active:opacity-80 transition-opacity"
            aria-label="Choose profile photo"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-stone-400">
                <Camera size={28} strokeWidth={1.5} />
                <span className="text-[10px] font-medium">Add photo</span>
              </div>
            )}
            {/* Overlay edit indicator when photo is set */}
            {photoPreview && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        {/* Birthday */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Birthday <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-stone-900 py-3.5 text-white font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
