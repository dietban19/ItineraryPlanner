import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  MapPin,
  Pencil,
  Search,
  Star,
  X,
  Loader,
  Clock,
  Globe,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import { useTrip, useTrips } from '../../context/TripContext';
import { searchPlaces, getPlaceDetails } from '../../services/places.service';

export default function ItineraryTab({ tripId }) {
  const trip = useTrip(tripId);
  const { addActivity, updateDayTitle, updateActivityTime } = useTrips();

  const [openDays, setOpenDays] = useState(() => {
    const firstId = trip?.days?.[0]?._id;
    return firstId ? { [firstId]: true } : {};
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);

  // For viewing/editing an existing activity
  const [viewingActivity, setViewingActivity] = useState(null);
  const [viewingDayId, setViewingDayId] = useState(null);

  if (!trip) return null;

  function toggle(id) {
    setOpenDays((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleTitleChange(dayId, title) {
    updateDayTitle(tripId, dayId, title);
  }

  function openAddDrawer(dayId) {
    setSelectedDayId(dayId);
    setDrawerOpen(true);
  }

  function closeAddDrawer() {
    setDrawerOpen(false);
    setSelectedDayId(null);
  }

  function handleAdd(activityData) {
    if (!selectedDayId) return;
    addActivity(tripId, selectedDayId, {
      name: activityData.name,
      time: activityData.time,
      image: activityData.image,
      rating: activityData.rating,
      placeId: activityData.placeId ?? null,
      type: activityData.type ?? 'activity',
    });
    setOpenDays((prev) => ({ ...prev, [selectedDayId]: true }));
    closeAddDrawer();
  }

  function openActivityDetail(dayId, activity) {
    setViewingDayId(dayId);
    setViewingActivity(activity);
  }

  function closeActivityDetail() {
    setViewingActivity(null);
    setViewingDayId(null);
  }

  function handleSaveTime(time) {
    if (!viewingDayId || !viewingActivity) return;
    updateActivityTime(tripId, viewingDayId, viewingActivity._id, time);
    closeActivityDetail();
  }

  if (trip.days.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-300">
        <p className="text-sm">No days found for this trip.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5 bg-[#FAFAF8] px-4 py-5">
        {trip.days.map((day) => (
          <DayRow
            key={day._id}
            day={day}
            isOpen={!!openDays[day._id]}
            onToggle={() => toggle(day._id)}
            onTitleChange={(title) => handleTitleChange(day._id, title)}
            onAddActivity={() => openAddDrawer(day._id)}
            onViewActivity={(activity) => openActivityDetail(day._id, activity)}
          />
        ))}
      </div>

      <AddActivityDrawer
        open={drawerOpen}
        destination={trip.destination}
        onClose={closeAddDrawer}
        onAdd={handleAdd}
      />

      {/* Existing activity detail sheet */}
      {viewingActivity && (
        <div className="fixed inset-0 z-50">
          <PlaceDetailSheet
            place={{
              name: viewingActivity.name,
              image: viewingActivity.image,
              rating: viewingActivity.rating,
              placeId: viewingActivity.placeId,
            }}
            initialTime={viewingActivity.time}
            mode="view"
            onClose={closeActivityDetail}
            onSaveTime={handleSaveTime}
          />
        </div>
      )}
    </>
  );
}

function DayRow({
  day,
  isOpen,
  onToggle,
  onTitleChange,
  onAddActivity,
  onViewActivity,
}) {
  const [editing, setEditing] = useState(false);
  const [titleVal, setTitleVal] = useState(day.title);
  const inputRef = useRef(null);

  useEffect(() => {
    setTitleVal(day.title);
  }, [day.title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commitTitle() {
    setEditing(false);
    const next = titleVal.trim() || `Day ${day.dayNum}`;
    setTitleVal(next);
    onTitleChange(next);
  }

  return (
    <article className="overflow-hidden rounded-[22px] border border-stone-200/70 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-5 text-left active:bg-stone-50"
      >
        <ChevronRight
          size={20}
          strokeWidth={1.9}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-stone-400">
              Day {day.dayNum}
            </span>
            <span className="font-display text-[12px] text-stone-400">
              {day.dayName} · {day.date}
            </span>
          </div>

          {editing ? (
            <input
              ref={inputRef}
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 w-full border-b border-stone-300 bg-transparent font-display text-[16px] leading-snug text-stone-950 outline-none"
            />
          ) : (
            <p className="mt-1 truncate font-display text-[16px] leading-snug text-stone-950">
              {day.title}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="-mr-1 p-2 text-stone-300 active:text-stone-500"
          aria-label="Edit day title"
        >
          <Pencil size={17} strokeWidth={1.8} />
        </button>
      </button>

      {isOpen && (
        <div className="border-t border-stone-100 px-5 pb-5 pt-4">
          <div className="flex flex-col gap-3">
            {day.activities.length === 0 ? (
              <EmptyActivityState />
            ) : (
              day.activities.map((activity) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  onViewDetail={() => onViewActivity?.(activity)}
                />
              ))
            )}

            <button
              onClick={onAddActivity}
              className="mt-1 flex h-[52px] items-center justify-center gap-2 rounded-[18px] border border-dashed border-stone-200 text-stone-400 active:bg-stone-50"
            >
              <Plus size={16} strokeWidth={1.8} />
              <span className="text-[14px]">Add activity</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function EmptyActivityState() {
  return (
    <div className="flex h-[52px] items-center gap-3 rounded-[18px] bg-[#FAFAF8] px-4">
      <MapPin size={16} strokeWidth={1.7} className="text-stone-400" />
      <p className="text-[14px] text-stone-400">No activities yet</p>
    </div>
  );
}

function ActivityCard({ activity, onViewDetail }) {
  const isDone = activity.status === 'done';

  return (
    <button className="w-full text-left" onClick={onViewDetail}>
      <article
        className={`flex items-center gap-4 rounded-[18px] p-3 active:scale-[0.98] transition-transform ${
          isDone ? 'bg-emerald-50/60' : 'bg-[#FAFAF8]'
        }`}
      >
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-[14px] bg-stone-100">
          {activity.image ? (
            <img
              src={activity.image}
              alt={activity.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-stone-300">
              <MapPin size={22} strokeWidth={1.6} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14px] font-semibold leading-tight text-stone-950">
              {activity.name}
            </p>
            {isDone && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Done
              </span>
            )}
          </div>

          <p className="mt-1 text-[12px] text-stone-400">
            {activity.time || 'No time set'}
          </p>

          {activity.rating && (
            <div className="mt-1 flex items-center gap-1 text-[12px] text-stone-400">
              <Star size={11} fill="currentColor" strokeWidth={0} />
              <span>{activity.rating}</span>
            </div>
          )}
        </div>
      </article>
    </button>
  );
}

function AddActivityDrawer({ open, destination, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const debounceRef = useRef(null);

  // Popular places fetched once on first open, cached in placesSearchCache
  const [popularActivities, setPopularActivities] = useState([]);
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const hasFetchedRef = useRef(false);
  const [seeMoreOpen, setSeeMoreOpen] = useState(null); // null | 'activities' | 'restaurants'

  // Fetch popular places when the drawer first opens
  useEffect(() => {
    if (!open || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setLoadingPopular(true);

    Promise.all([
      searchPlaces({ destination, type: 'activity', maxResults: 20 }),
      searchPlaces({ destination, type: 'restaurant', maxResults: 20 }),
    ])
      .then(([acts, rests]) => {
        setPopularActivities(acts);
        setPopularRestaurants(rests);
      })
      .catch(() => {
        // silently fall back to empty
      })
      .finally(() => setLoadingPopular(false));
  }, [open, destination]);

  const runSearch = useCallback(
    async (q) => {
      if (!q.trim()) {
        setSearchResults(null);
        return;
      }
      setSearching(true);
      try {
        const results = await searchPlaces({
          query: q,
          destination,
          maxResults: 8,
        });
        setSearchResults(results);
      } catch {
        // silently fall back to suggestions
        setSearchResults(null);
      } finally {
        setSearching(false);
      }
    },
    [destination],
  );

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(val), 500);
  }

  // Reset search when drawer closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSearchResults(null);
      setSelectedPlace(null);
      setSeeMoreOpen(null);
    }
  }, [open]);

  const displaySearchResults = searchResults;
  const displayActivities = searchResults
    ? searchResults.filter((p) => p.type !== 'restaurant')
    : popularActivities;
  const displayRestaurants = searchResults
    ? searchResults.filter((p) => p.type === 'restaurant')
    : popularRestaurants;

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <button
        aria-label="Close drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <section
        className={`absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-[32px] bg-[#FAFAF8] shadow-[0_-18px_60px_rgba(0,0,0,0.18)] transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Fixed top: handle + title + search */}
        <div className="shrink-0 px-5 pb-4 pt-3">
          <div className="mx-auto mb-4 h-1 w-11 rounded-full bg-stone-300" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[20px] font-semibold leading-none text-stone-950">
                Add activity
              </p>
              <p className="mt-1 text-xs text-stone-400">{destination}</p>
            </div>

            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500"
              aria-label="Close"
            >
              <X size={17} strokeWidth={1.9} />
            </button>
          </div>

          <div className="mt-4 flex h-10 items-center gap-3 rounded-full border border-stone-200 bg-white px-4">
            {searching ? (
              <Loader
                size={16}
                strokeWidth={1.9}
                className="animate-spin text-stone-400"
              />
            ) : (
              <Search size={16} strokeWidth={1.9} className="text-stone-400" />
            )}
            <input
              value={query}
              onChange={handleQueryChange}
              placeholder="Search places, food, views..."
              className="h-full flex-1 bg-transparent text-[13px] text-stone-900 outline-none placeholder:text-stone-400"
            />
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchResults(null);
                }}
                className="text-stone-400"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-8">
          {/* Loading skeletons while fetching popular places */}
          {loadingPopular && !displaySearchResults ? (
            <div className="mt-4">
              <div className="mb-3 h-4 w-28 rounded-full bg-stone-200/70 animate-pulse" />
              <div className="-mx-5 overflow-x-auto px-5 pb-2">
                <div className="flex w-max gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-37.5 shrink-0">
                      <div className="aspect-4/3 rounded-2xl bg-stone-200/70 animate-pulse" />
                      <div className="mt-2 h-3 w-24 rounded-full bg-stone-200/70 animate-pulse" />
                      <div className="mt-1.5 h-3 w-10 rounded-full bg-stone-200/70 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 mb-3 h-4 w-24 rounded-full bg-stone-200/70 animate-pulse" />
              <div className="-mx-5 overflow-x-auto px-5 pb-2">
                <div className="flex w-max gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-37.5 shrink-0">
                      <div className="aspect-4/3 rounded-2xl bg-stone-200/70 animate-pulse" />
                      <div className="mt-2 h-3 w-24 rounded-full bg-stone-200/70 animate-pulse" />
                      <div className="mt-1.5 h-3 w-10 rounded-full bg-stone-200/70 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : displaySearchResults &&
            displaySearchResults.length === 0 &&
            !searching ? (
            <div className="flex items-center justify-center py-12 text-stone-400">
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <>
              {displayActivities.length > 0 && (
                <section className="mt-4">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold leading-none text-stone-950">
                        Things to do
                      </h3>
                      <p className="mt-1 text-xs text-stone-400">
                        {displaySearchResults
                          ? `Results near ${destination.split(',')[0]}`
                          : `Popular around ${destination.split(',')[0]}`}
                      </p>
                    </div>
                    {displayActivities.length > 4 && (
                      <button
                        onClick={() => setSeeMoreOpen('activities')}
                        className="text-[13px] font-medium text-stone-500 active:text-stone-800"
                      >
                        See more
                      </button>
                    )}
                  </div>

                  <div className="-mx-5 overflow-x-auto px-5 pb-2">
                    <div className="flex w-max gap-3">
                      {displayActivities.map((activity, i) => (
                        <SuggestedActivityCard
                          key={activity.placeId ?? activity._id ?? i}
                          activity={activity}
                          onAdd={() =>
                            onAdd({
                              name: activity.name,
                              image: activity.image,
                              rating: activity.rating,
                              placeId: activity.placeId ?? null,
                              type: activity.type ?? 'activity',
                              time: activity.time ?? '',
                              _id: activity.placeId ?? activity._id,
                            })
                          }
                          onViewDetail={() => setSelectedPlace(activity)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {displayRestaurants.length > 0 && (
                <section className="mt-6">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold leading-none text-stone-950">
                        Restaurants
                      </h3>
                      <p className="mt-1 text-xs text-stone-400">
                        {displaySearchResults
                          ? `Results near ${destination.split(',')[0]}`
                          : `Popular around ${destination.split(',')[0]}`}
                      </p>
                    </div>
                    {displayRestaurants.length > 4 && (
                      <button
                        onClick={() => setSeeMoreOpen('restaurants')}
                        className="text-[13px] font-medium text-stone-500 active:text-stone-800"
                      >
                        See more
                      </button>
                    )}
                  </div>

                  <div className="-mx-5 overflow-x-auto px-5 pb-2">
                    <div className="flex w-max gap-3">
                      {displayRestaurants.map((restaurant, i) => (
                        <SuggestedActivityCard
                          key={restaurant.placeId ?? restaurant._id ?? i}
                          activity={restaurant}
                          onAdd={() =>
                            onAdd({
                              name: restaurant.name,
                              image: restaurant.image,
                              rating: restaurant.rating,
                              placeId: restaurant.placeId ?? null,
                              type: 'restaurant',
                              time: restaurant.time ?? '',
                              _id: restaurant.placeId ?? restaurant._id,
                            })
                          }
                          onViewDetail={() => setSelectedPlace(restaurant)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* See more grid overlay */}
        {seeMoreOpen && (
          <SeeMoreGrid
            title={
              seeMoreOpen === 'activities' ? 'Things to do' : 'Restaurants'
            }
            subtitle={
              displaySearchResults
                ? `Results near ${destination.split(',')[0]}`
                : `Popular around ${destination.split(',')[0]}`
            }
            items={
              seeMoreOpen === 'activities'
                ? displayActivities
                : displayRestaurants
            }
            onClose={() => setSeeMoreOpen(null)}
            onAdd={(item) =>
              onAdd({
                name: item.name,
                image: item.image,
                rating: item.rating,
                placeId: item.placeId ?? null,
                type:
                  item.type ??
                  (seeMoreOpen === 'restaurants' ? 'restaurant' : 'activity'),
                time: item.time ?? '',
                _id: item.placeId ?? item._id,
              })
            }
            onViewDetail={(item) => {
              setSeeMoreOpen(null);
              setSelectedPlace(item);
            }}
          />
        )}
      </section>

      {/* Place detail sheet — slides in from the right over the drawer */}
      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          initialTime=""
          mode="add"
          onClose={() => setSelectedPlace(null)}
          onAdd={(time) => {
            onAdd({
              name: selectedPlace.name,
              image: selectedPlace.image,
              rating: selectedPlace.rating,
              placeId: selectedPlace.placeId ?? null,
              type: selectedPlace.type ?? 'activity',
              time: time ?? '',
              _id: selectedPlace.placeId ?? selectedPlace._id,
            });
            setSelectedPlace(null);
          }}
        />
      )}
    </div>
  );
}

function SuggestedActivityCard({ activity, onAdd, onViewDetail }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className="w-[220px] shrink-0" onClick={onViewDetail}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-stone-100">
        {activity.image && !imgFailed ? (
          <img
            src={activity.image}
            alt={activity.name}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-stone-300">
            <MapPin size={28} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-stone-950 shadow-sm active:scale-95"
          aria-label={`Add ${activity.name}`}
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-2">
        <p className="line-clamp-1 text-[13px] font-semibold leading-tight text-stone-950">
          {activity.name}
        </p>

        <div className="mt-0.5 flex items-center gap-1 text-[12px] text-stone-400">
          <Star size={11} fill="currentColor" strokeWidth={0} />
          <span>{activity.rating}</span>
        </div>
      </div>
    </article>
  );
}

function SeeMoreGrid({ title, subtitle, items, onClose, onAdd, onViewDetail }) {
  const BATCH = 6;
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const [entered, setEntered] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  // Reset when switching between categories
  useEffect(() => {
    setVisibleCount(BATCH);
  }, [items]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((c) => c + BATCH);
            setLoadingMore(false);
          }, 600);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col rounded-t-[32px] bg-[#FAFAF8] transition-transform duration-300 ${
        entered ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="shrink-0 px-5 pb-4 pt-3">
        <div className="mx-auto mb-4 h-1 w-11 rounded-full bg-stone-300" />
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-stone-600"
            aria-label="Back"
          >
            <ArrowLeft size={17} strokeWidth={1.9} />
          </button>
          <div>
            <p className="text-[18px] font-semibold leading-none text-stone-950">
              {title}
            </p>
            <p className="mt-1 text-xs text-stone-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {visibleItems.map((item, i) => (
            <GridActivityCard
              key={item.placeId ?? item._id ?? i}
              activity={item}
              onAdd={() => onAdd(item)}
              onViewDetail={() => onViewDetail(item)}
            />
          ))}

          {/* Skeleton cards while loading next batch */}
          {loadingMore &&
            Array.from({ length: 2 }).map((_, i) => (
              <div key={`skel-${i}`} className="w-full">
                <div className="aspect-[3/2] rounded-[14px] bg-stone-200/70 animate-pulse" />
                <div className="mt-2 h-3 w-3/4 rounded-full bg-stone-200/70 animate-pulse" />
                <div className="mt-1.5 h-3 w-1/4 rounded-full bg-stone-200/70 animate-pulse" />
              </div>
            ))}
        </div>

        {/* Sentinel — triggers next batch when scrolled into view */}
        {hasMore && <div ref={sentinelRef} className="h-4" />}
      </div>
    </div>
  );
}

function GridActivityCard({ activity, onAdd, onViewDetail }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className="w-full" onClick={onViewDetail}>
      <div className="relative aspect-[6/5] overflow-hidden rounded-[14px] bg-stone-100">
        {activity.image && !imgFailed ? (
          <img
            src={activity.image}
            alt={activity.name}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-stone-300">
            <MapPin size={24} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-stone-950 shadow-sm active:scale-95"
          aria-label={`Add ${activity.name}`}
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-1.5">
        <p className="line-clamp-1 text-[12px] font-semibold leading-tight text-stone-950">
          {activity.name}
        </p>
        {activity.rating && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-400">
            <Star size={10} fill="currentColor" strokeWidth={0} />
            <span>{activity.rating}</span>
          </div>
        )}
      </div>
    </article>
  );
}

// Helper: "09:00" → "9:00 AM"
function formatTime(timeStr) {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// Helper: "9:00 AM" → "09:00"
function toInputTime(display) {
  if (!display) return '';
  const match = display.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '';
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ap = match[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

function PlaceDetailSheet({
  place,
  initialTime = '',
  mode = 'add',
  onClose,
  onAdd,
  onSaveTime,
}) {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(!!place.placeId);
  const [heroFailed, setHeroFailed] = useState(false);
  const [entered, setEntered] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [timeVal, setTimeVal] = useState(() => toInputTime(initialTime));
  const [hoursExpanded, setHoursExpanded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  useEffect(() => {
    if (!place.placeId) return;
    setLoadingDetails(true);
    getPlaceDetails(place.placeId)
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setLoadingDetails(false));
  }, [place.placeId]);

  function handleClose() {
    setEntered(false);
    setTimeout(onClose, 280);
  }

  const photos = details?.photos?.length
    ? details.photos
    : place.image
      ? [place.image]
      : [];
  const heroImage = photos[photoIndex] ?? null;

  const displayRating = details?.rating ?? place.rating;
  const displayAddress = details?.address ?? place.address;
  const displayName = details?.name ?? place.name;

  function handleCTA() {
    const formatted = formatTime(timeVal) || '';
    if (mode === 'add') {
      onAdd?.(formatted);
    } else {
      onSaveTime?.(formatted);
    }
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-[#FAFAF8] transition-transform duration-300 ease-out ${
        entered ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative w-full shrink-0" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 bg-stone-200 overflow-hidden">
          {heroImage && !heroFailed ? (
            <img
              src={heroImage}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setHeroFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-stone-300">
              <MapPin size={44} strokeWidth={1.3} />
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20 pointer-events-none" />

        {/* Back button */}
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Back"
        >
          <ArrowLeft size={19} strokeWidth={2} />
        </button>

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white disabled:opacity-30"
              disabled={photoIndex === 0}
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button
              onClick={() =>
                setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white disabled:opacity-30"
              disabled={photoIndex === photos.length - 1}
              aria-label="Next photo"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === photoIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Name + address overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-[20px] font-bold leading-tight text-white drop-shadow">
            {displayName}
          </p>
          {displayAddress && (
            <p className="mt-1 flex items-center gap-1 font-display text-[12px] text-white/75">
              <MapPin size={11} strokeWidth={2} className="shrink-0" />
              <span className="line-clamp-1">{displayAddress}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Rating + open/closed row */}
        {displayRating && (
          <div className="flex items-center gap-2.5 border-b border-stone-100 px-5 py-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(displayRating) ? '#f59e0b' : 'none'}
                  stroke={
                    s <= Math.round(displayRating) ? '#f59e0b' : '#d6d3d1'
                  }
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="font-display text-[14px] font-bold text-stone-900">
              {displayRating}
            </span>
            {details?.userRatingCount && (
              <span className="font-display text-[13px] text-stone-400">
                ({details.userRatingCount.toLocaleString()} reviews)
              </span>
            )}
            {details?.isOpen !== null && details?.isOpen !== undefined && (
              <span
                className={`ml-auto rounded-full px-2.5 py-0.5 font-display text-[11px] font-semibold ${
                  details.isOpen
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-50 text-red-500'
                }`}
              >
                {details.isOpen ? 'Open now' : 'Closed'}
              </span>
            )}
          </div>
        )}

        {/* Overview section */}
        {(details?.description || loadingDetails) && (
          <div className="px-5 py-5 border-b border-stone-100">
            <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">
              Overview
            </h3>
            {loadingDetails ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 w-full rounded-full bg-stone-200" />
                <div className="h-3 w-4/5 rounded-full bg-stone-200" />
                <div className="h-3 w-3/5 rounded-full bg-stone-200" />
              </div>
            ) : (
              <p className="font-display text-[14px] leading-relaxed text-stone-600">
                {details.description}
              </p>
            )}
          </div>
        )}

        {/* Info rows: address, website, phone */}
        {(displayAddress || details?.website || details?.phone) && (
          <div className="px-5 py-5 border-b border-stone-100 space-y-4">
            <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-stone-400">
              Info
            </h3>

            {displayAddress && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <MapPin
                    size={15}
                    strokeWidth={1.8}
                    className="text-stone-500"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Address
                  </p>
                  <p className="font-display text-[13px] leading-snug text-stone-700 mt-0.5">
                    {displayAddress}
                  </p>
                </div>
              </div>
            )}

            {details?.website && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <Globe
                    size={15}
                    strokeWidth={1.8}
                    className="text-stone-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Website
                  </p>
                  <a
                    href={details.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-[13px] text-stone-700 underline underline-offset-2 mt-0.5 block truncate"
                  >
                    {details.website
                      .replace(/^https?:\/\//, '')
                      .replace(/\/$/, '')}
                  </a>
                </div>
              </div>
            )}

            {details?.phone && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <Phone
                    size={15}
                    strokeWidth={1.8}
                    className="text-stone-500"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Phone
                  </p>
                  <a
                    href={`tel:${details.phone}`}
                    className="font-display text-[13px] text-stone-700 mt-0.5 block"
                  >
                    {details.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hours of operation */}
        {(details?.hours?.length > 0 || loadingDetails) && (
          <div className="px-5 py-5 border-b border-stone-100">
            <button
              onClick={() => setHoursExpanded((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-stone-400">
                Hours
              </h3>
              <ChevronRight
                size={16}
                strokeWidth={1.9}
                className={`text-stone-400 transition-transform ${
                  hoursExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>

            {hoursExpanded && (
              <div className="mt-3 space-y-1.5">
                {loadingDetails ? (
                  <div className="space-y-2 animate-pulse">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-full rounded-full bg-stone-200"
                      />
                    ))}
                  </div>
                ) : (
                  details.hours.map((line, i) => {
                    const colonIdx = line.indexOf(':');
                    const day = colonIdx > -1 ? line.slice(0, colonIdx) : line;
                    const time =
                      colonIdx > -1 ? line.slice(colonIdx + 1).trim() : '';
                    return (
                      <div key={i} className="flex justify-between gap-4">
                        <span className="font-display text-[13px] font-medium text-stone-700 w-24 shrink-0">
                          {day}
                        </span>
                        <span className="font-display text-[13px] text-stone-500 text-right">
                          {time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="px-5 py-5 pb-8">
          <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-4">
            Reviews
          </h3>

          {loadingDetails ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-4 animate-pulse space-y-2"
                >
                  <div className="h-3 w-32 rounded-full bg-stone-200" />
                  <div className="h-3 w-full rounded-full bg-stone-200" />
                  <div className="h-3 w-3/4 rounded-full bg-stone-200" />
                </div>
              ))}
            </div>
          ) : details?.reviews?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {details.reviews.map((review, i) => (
                <div key={i} className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-[13px] font-semibold text-stone-900">
                      {review.author}
                    </span>
                    <span className="font-display text-[11px] text-stone-400">
                      {review.time}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill={s <= review.rating ? '#f59e0b' : 'none'}
                        stroke={s <= review.rating ? '#f59e0b' : '#d6d3d1'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="font-display text-[13px] leading-relaxed text-stone-600 line-clamp-4">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          ) : !loadingDetails && !place.placeId ? null : (
            <p className="font-display text-[13px] text-stone-400">
              No reviews available.
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom bar: time + CTA ─────────────────────────────── */}
      <div className="shrink-0 border-t border-stone-100 bg-white px-5 py-4 space-y-3">
        {/* Time picker row */}
        <div className="flex items-center gap-3 rounded-2xl bg-[#FAFAF8] px-4 py-3">
          <Clock
            size={16}
            strokeWidth={1.8}
            className="text-stone-400 shrink-0"
          />
          <div className="flex-1">
            <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              Time
            </p>
            <input
              type="time"
              value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)}
              className="font-display text-[14px] text-stone-900 bg-transparent outline-none w-full mt-0.5"
            />
          </div>
          {timeVal && (
            <span className="font-display text-[13px] font-medium text-stone-500">
              {formatTime(timeVal)}
            </span>
          )}
        </div>

        <button
          onClick={handleCTA}
          className="w-full rounded-2xl bg-stone-900 py-4 font-display text-[14px] font-semibold text-white active:scale-[0.98] transition-transform"
        >
          {mode === 'add' ? 'Add to Itinerary' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
