import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MapPin, Search, X } from 'lucide-react';
import { searchDestinations } from '../../services/destination.service';

const POPULAR_DESTINATIONS = [
  { city: 'Paris', country: 'France', emoji: '🇫🇷' },
  { city: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { city: 'New York', country: 'United States', emoji: '🇺🇸' },
  { city: 'Santorini', country: 'Greece', emoji: '🇬🇷' },
  { city: 'Bali', country: 'Indonesia', emoji: '🇮🇩' },
  { city: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { city: 'Amalfi', country: 'Italy', emoji: '🇮🇹' },
  { city: 'Dubai', country: 'United Arab Emirates', emoji: '🇦🇪' },
];

export default function AddLocationDrawer({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }

    setQuery('');
    setResults([]);
    setError('');
  }, [isOpen]);

  useEffect(() => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setResults([]);
      setIsSearching(false);
      setError('');
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        setError('');

        const destinations = await searchDestinations(cleanQuery, {
          signal: controller.signal,
        });

        setResults(destinations);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not search destinations');
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const showingSearch = query.trim().length > 0;
  const destinations = showingSearch ? results : POPULAR_DESTINATIONS;

  function handleSelect(dest) {
    const label = dest.label || `${dest.city}, ${dest.country}`;

    onSelect(label);
    onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white transition-transform duration-300 ease-out"
        style={{
          height: '92svh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-stone-200" />
        </div>

        <div className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-stone-100 active:bg-stone-200"
          >
            <ArrowLeft size={20} className="text-stone-700" />
          </button>

          <h2 className="font-display text-[24px] leading-none text-stone-950">
            Add Location
          </h2>
        </div>

        <div className="shrink-0 px-4 pb-3">
          <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-[#FAFAF8] px-4 py-3">
            <Search size={16} className="shrink-0 text-stone-400" />

            <input
              ref={inputRef}
              type="text"
              placeholder="Search destinations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-stone-800 outline-none placeholder:text-stone-400"
            />

            {query.length > 0 && (
              <button onClick={() => setQuery('')} className="p-0.5">
                <X size={15} className="text-stone-400" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
            {showingSearch ? 'Results' : 'Popular Destinations'}
          </p>

          {isSearching ? (
            <p className="py-8 text-center text-sm text-stone-400">
              Searching...
            </p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-stone-400">{error}</p>
          ) : destinations.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              No destinations found
            </p>
          ) : (
            <div className="space-y-1">
              {destinations.map((dest) => (
                <button
                  key={dest.id || `${dest.city}-${dest.country}`}
                  onClick={() => handleSelect(dest)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-stone-50 active:bg-stone-100"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FAFAF8] text-lg">
                    {dest.emoji || (
                      <MapPin size={17} className="text-stone-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-stone-900">
                      {dest.city}
                    </p>
                    <p className="truncate text-[12px] text-stone-400">
                      {[dest.region, dest.country].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  <MapPin size={14} className="shrink-0 text-stone-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
