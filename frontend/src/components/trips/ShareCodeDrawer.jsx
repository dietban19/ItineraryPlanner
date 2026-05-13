import { useState } from 'react';
import { X, Copy, Check, Share2, Loader } from 'lucide-react';
import { useTrips } from '../../context/TripContext';

/**
 * Shows the trip's share code so the owner can hand it to friends.
 * Friends enter the code in the "Join Trip" tab of the New Trip drawer.
 * Generates a code on-demand if the trip was created before share codes existed.
 */
export default function ShareCodeDrawer({ isOpen, onClose, trip }) {
  const { ensureShareCode } = useTrips();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const code = trip?.shareCode ?? null;

  async function handleGenerate() {
    if (!trip?._id) return;
    setGenerating(true);
    setError('');
    try {
      await ensureShareCode(trip._id);
    } catch {
      setError('Failed to generate code. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function handleClose() {
    setCopied(false);
    setError('');
    onClose();
  }

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older WebViews
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `Join my trip — ${trip?.title ?? ''}`,
        text: `Use code ${code} to join my trip on Itinerary!`,
      });
    } catch {
      // User cancelled or share failed — do nothing
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-base font-bold text-stone-900">Invite to Trip</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 -mr-1 text-stone-400 active:bg-stone-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-8 flex flex-col gap-5">
          <p className="text-sm text-stone-500 leading-relaxed">
            Share this code with friends. They can enter it in the{' '}
            <span className="font-semibold text-stone-700">Join Trip</span> tab
            when creating a new trip.
          </p>

          {/* Code display */}
          <div className="flex flex-col items-center gap-3 bg-stone-50 rounded-2xl py-7 px-4 border border-stone-100">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
              Trip Code
            </span>
            {generating ? (
              <Loader size={28} className="animate-spin text-stone-400" />
            ) : error ? (
              <span className="text-sm text-red-500 text-center">{error}</span>
            ) : code ? (
              <span className="font-mono text-4xl font-bold tracking-[0.2em] text-stone-900 select-all">
                {code}
              </span>
            ) : (
              <button
                onClick={handleGenerate}
                className="px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold active:bg-stone-700 transition-colors duration-200"
              >
                Generate Trip Code
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={!code || generating}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none ${
                copied
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-stone-100 text-stone-800 active:bg-stone-200'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} strokeWidth={2} />
                  Copy Code
                </>
              )}
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleNativeShare}
                disabled={!code || generating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-stone-900 text-white active:bg-stone-700 transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Share2 size={16} strokeWidth={2} />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
