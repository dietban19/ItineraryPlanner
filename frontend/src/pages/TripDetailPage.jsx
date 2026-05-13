import { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Share2 } from 'lucide-react';
import OverviewTab from '../components/tripdetail/OverviewTab';
import ItineraryTab from '../components/tripdetail/ItineraryTab';
import MemoriesTab from '../components/tripdetail/MemoriesTab';
import ChatTab from '../components/tripdetail/ChatTab';
import { useTrip, useTrips } from '../context/TripContext';
import DateRangeDrawer from '../components/trips/DateRangeDrawer';
import ShareCodeDrawer from '../components/trips/ShareCodeDrawer';

const TABS = ['Overview', 'Itinerary', 'Memories', 'Chat'];

export default function TripDetailPage() {
  const { state } = useLocation();
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  // Prefer explicit tripId from navigation state; fall back to URL param or
  // legacy state.trip._id for backward compatibility.
  const tripId = state?.tripId ?? paramId ?? state?.trip?._id;
  const trip = useTrip(tripId);

  const { updateDateRange } = useTrips();
  const [activeTab, setActiveTab] = useState('Overview');
  const [visible, setVisible] = useState(true);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  // Fade hero out over the first 65% of its height as the user scrolls
  const handleScroll = useCallback(
    (e) => {
      if (activeTab !== 'Overview') return;
      const scrollY = e.currentTarget.scrollTop;
      const heroHeight = e.currentTarget.offsetWidth * (9 / 16);
      setHeroOpacity(Math.max(0, 1 - scrollY / (heroHeight * 0.65)));
    },
    [activeTab],
  );

  if (!trip) {
    navigate('/trips', { replace: true });
    return null;
  }

  const isOverview = activeTab === 'Overview';
  const showCompactHeader = !isOverview || heroOpacity < 0.5;

  function switchTab(tab) {
    if (tab === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setVisible(true);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      if (tab === 'Overview') setHeroOpacity(1);
    }, 150);
  }

  return (
    <div className="relative h-dvh bg-stone-50 font-display overflow-hidden">
      {/* ── Hero back + share buttons — z-30 so they sit above the z-10 scroll container ── */}
      {isOverview && (
        <>
          <button
            onClick={() => navigate(-1)}
            className="absolute z-30 bg-black/30 backdrop-blur-sm rounded-full p-2 text-white"
            style={{
              top: 'calc(env(safe-area-inset-top) + 1rem)',
              left: '1rem',
              opacity: heroOpacity,
              pointerEvents: heroOpacity > 0.3 ? 'auto' : 'none',
              transition: 'opacity 0.1s',
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <button
            onClick={() => setShareDrawerOpen(true)}
            className="absolute z-30 bg-black/30 backdrop-blur-sm rounded-full p-2 text-white"
            style={{
              top: 'calc(env(safe-area-inset-top) + 1rem)',
              right: '1rem',
              opacity: heroOpacity,
              pointerEvents: heroOpacity > 0.3 ? 'auto' : 'none',
              transition: 'opacity 0.1s',
            }}
            aria-label="Share trip"
          >
            <Share2 size={20} strokeWidth={2} />
          </button>
        </>
      )}

      {/* ── Hero — fades out as user scrolls (Overview only) ── */}
      {isOverview && (
        <div
          className="absolute inset-x-0 top-0 z-0 w-full aspect-video"
          style={{ opacity: heroOpacity }}
        >
          <img
            src={trip.image}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/30 to-black/85" />

          <div
            className="absolute bottom-5 left-5 z-10 flex flex-col"
            style={{ pointerEvents: 'none' }}
          >
            <h1 className="text-white text-3xl font-bold leading-tight drop-shadow-md">
              {trip.title}
            </h1>
            <div className="inline-flex divide-x divide-white/40 mt-2 text-[0.95rem]">
              <div className="flex items-center px-3 py-1.5">
                <span className="font-semibold text-white whitespace-nowrap">
                  {trip.destination}
                </span>
              </div>
              <button
                onClick={() => setDateDrawerOpen(true)}
                className="flex items-center px-3 py-1.5 active:opacity-60 transition-opacity"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="font-semibold text-white whitespace-nowrap">
                  {trip.dateRange.label || 'Set dates'}
                </span>
              </button>
              <div className="flex items-center gap-1 px-3 py-1.5">
                <Users
                  size={12}
                  className="text-white shrink-0"
                  strokeWidth={1.8}
                />
                <span className="font-semibold text-white whitespace-nowrap">
                  {trip.people}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOverview ? (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 z-10 flex flex-col overflow-y-auto transition-opacity duration-150 ease-in-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="w-full aspect-video shrink-0 pointer-events-none" />

          <div className="shrink-0 sticky top-0 z-20 bg-white border-b border-stone-100">
            <div
              className="overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out"
              style={{
                maxHeight: showCompactHeader ? '72px' : '0px',
                opacity: Math.min(1, (1 - heroOpacity) * 2),
              }}
            >
              <div
                className="flex items-center gap-3 px-4 pb-2"
                style={{
                  paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)',
                }}
              >
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-full p-1.5 -ml-1 text-stone-600 active:bg-stone-100"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} strokeWidth={2} />
                </button>
                <h1 className="text-base font-bold text-stone-900 truncate">
                  {trip.title}
                </h1>
              </div>
            </div>

            <div className="flex px-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`py-2.5 mr-5 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <OverviewTab tripId={trip._id} />
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 z-10 flex flex-col transition-opacity duration-150 ease-in-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="shrink-0 bg-white border-b border-stone-100">
            <div
              className="flex items-center gap-3 px-4 pb-2"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            >
              <button
                onClick={() => navigate(-1)}
                className="rounded-full p-1.5 -ml-1 text-stone-600 active:bg-stone-100"
                aria-label="Go back"
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
              <h1 className="text-base font-bold text-stone-900 truncate">
                {trip.title}
              </h1>
            </div>

            <div className="flex px-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`py-2.5 mr-5 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={scrollRef}
            className={`flex-1 ${
              activeTab === 'Chat'
                ? 'overflow-hidden flex flex-col'
                : 'overflow-y-auto'
            }`}
          >
            <div
              className={
                activeTab === 'Chat'
                  ? 'flex-1 flex flex-col overflow-hidden'
                  : ''
              }
            >
              {activeTab === 'Itinerary' && <ItineraryTab tripId={trip._id} />}
              {activeTab === 'Memories' && <MemoriesTab tripId={trip._id} />}
              {activeTab === 'Chat' && <ChatTab trip={trip} />}
            </div>
          </div>
        </div>
      )}
      <DateRangeDrawer
        isOpen={dateDrawerOpen}
        onClose={() => setDateDrawerOpen(false)}
        initialStart={trip.dateRange.start || ''}
        initialEnd={trip.dateRange.end || ''}
        onSave={(range) => updateDateRange(trip._id, range)}
      />
      <ShareCodeDrawer
        isOpen={shareDrawerOpen}
        onClose={() => setShareDrawerOpen(false)}
        trip={trip}
      />
    </div>
  );
}
