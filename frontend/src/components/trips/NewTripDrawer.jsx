import { useState } from 'react';
import { X, MapPin, Tag, ChevronRight, Calendar, Hash } from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { useNavigate } from 'react-router-dom';
import AddLocationDrawer from './AddLocationDrawer';
import DateRangeDrawer, { formatDateLabel } from './DateRangeDrawer';

const TABS = ['Create Trip', 'Join Trip'];

export default function NewTripDrawer({ isOpen, onClose }) {
  const { createTrip, joinTrip } = useTrips();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Create Trip');

  // ── Create state ─────────────────────────────────────────────────────────────
  const [destination, setDestination] = useState('');
  const [tripName, setTripName] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '', label: '' });
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);

  // ── Join state ───────────────────────────────────────────────────────────────
  const [code, setCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  async function handleCreate() {
    if (!destination) return;
    setCreateLoading(true);
    try {
      const tripId = await createTrip({
        title: tripName.trim() || `Trip to ${destination.split(',')[0]}`,
        destination,
        dateRange: dateRange.start ? dateRange : undefined,
      });
      handleClose();
      if (tripId) navigate(`/trips/${tripId}`, { state: { tripId } });
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setJoinLoading(true);
    setJoinError('');
    setJoinSuccess(false);
    try {
      const tripId = await joinTrip(trimmed);
      setJoinSuccess(true);
      setTimeout(() => {
        handleClose();
        navigate(`/trips/${tripId}`, { state: { tripId } });
      }, 800);
    } catch (err) {
      if (err.message === 'not_found')
        setJoinError(
          'No trip found with that code. Double-check and try again.',
        );
      else if (err.message === 'already_member')
        setJoinError('You are already in this trip.');
      else setJoinError('Something went wrong. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setDestination('');
      setTripName('');
      setDateRange({ start: '', end: '', label: '' });
      setLocationOpen(false);
      setDateDrawerOpen(false);
      setCode('');
      setJoinError('');
      setJoinSuccess(false);
      setActiveTab('Create Trip');
      setCreateLoading(false);
    }, 300);
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
        className="fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          height: '92svh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 active:bg-stone-200 transition-colors"
        >
          <X size={17} className="text-stone-600" />
        </button>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Create Trip panel ──────────────────────────────────────────────── */}
        {activeTab === 'Create Trip' && (
          <div className="px-6 pt-5 pb-10 flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold text-stone-800 mb-1">
              Where to First?
            </h2>
            <p className="text-sm text-stone-400 mb-7">
              Pick a destination and name your adventure.
            </p>

            {/* Destination */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                Destination
              </label>
              <button
                onClick={() => setLocationOpen(true)}
                className="w-full flex items-center gap-3 bg-stone-100 rounded-2xl px-4 py-4 text-left active:bg-stone-200 transition-colors"
              >
                <MapPin
                  size={18}
                  className={destination ? 'text-stone-800' : 'text-stone-400'}
                />
                <span
                  className={`flex-1 text-sm ${destination ? 'text-stone-800 font-medium' : 'text-stone-400'}`}
                >
                  {destination || 'Search for a destination…'}
                </span>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </button>
            </div>

            {/* Trip name */}
            <div className="mb-8">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                Trip Name
              </label>
              <div className="flex items-center gap-3 bg-stone-100 rounded-2xl px-4 py-4">
                <Tag size={17} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    destination
                      ? `Trip to ${destination.split(',')[0]}`
                      : 'Give your trip a name…'
                  }
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 outline-none"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="mb-8">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                Dates
              </label>
              <button
                onClick={() => setDateDrawerOpen(true)}
                className="w-full flex items-center gap-3 bg-stone-100 rounded-2xl px-4 py-4 text-left active:bg-stone-200 transition-colors"
              >
                <Calendar
                  size={17}
                  className={
                    dateRange.start ? 'text-stone-800' : 'text-stone-400'
                  }
                />
                <span
                  className={`flex-1 text-sm ${dateRange.start ? 'text-stone-800 font-medium' : 'text-stone-400'}`}
                >
                  {dateRange.label || 'Add travel dates…'}
                </span>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={!destination || createLoading}
              className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                destination && !createLoading
                  ? 'bg-stone-800 text-white active:scale-[0.98]'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
            >
              {createLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
        )}

        {/* ── Join Trip panel ────────────────────────────────────────────────── */}
        {activeTab === 'Join Trip' && (
          <div className="px-6 pt-5 pb-10 flex-1 flex flex-col">
            <h2 className="text-2xl font-bold text-stone-800 mb-1">
              Join a Trip
            </h2>
            <p className="text-sm text-stone-400 mb-8">
              Enter the 8-character code shared by your travel buddy.
            </p>

            {/* Code input */}
            <div className="flex items-center gap-3 bg-stone-100 rounded-2xl px-4 py-4 mb-4">
              <Hash size={17} className="text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="e.g. ABCD1234"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setJoinError('');
                  setJoinSuccess(false);
                }}
                maxLength={8}
                autoCapitalize="characters"
                spellCheck={false}
                className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 outline-none tracking-widest font-mono"
              />
            </div>

            {joinError && (
              <p className="text-sm text-red-500 mb-4">{joinError}</p>
            )}
            {joinSuccess && (
              <p className="text-sm text-emerald-600 mb-4 font-medium">
                You&apos;ve joined the trip! 🎉
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={code.trim().length < 4 || joinLoading || joinSuccess}
              className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all ${
                code.trim().length >= 4 && !joinLoading && !joinSuccess
                  ? 'bg-stone-800 text-white active:scale-[0.98]'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
            >
              {joinLoading
                ? 'Looking up trip…'
                : joinSuccess
                  ? 'Joined!'
                  : 'Join Trip'}
            </button>
          </div>
        )}
      </div>

      {/* Add Location drawer */}
      <AddLocationDrawer
        isOpen={locationOpen}
        onClose={() => setLocationOpen(false)}
        onSelect={(dest) => setDestination(dest)}
      />

      {/* Date Range drawer */}
      <DateRangeDrawer
        isOpen={dateDrawerOpen}
        onClose={() => setDateDrawerOpen(false)}
        initialStart={dateRange.start}
        initialEnd={dateRange.end}
        onSave={(range) => setDateRange(range)}
      />
    </>
  );
}
