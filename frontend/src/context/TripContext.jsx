import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Trip, Day, Activity, ActivityReview } from '../models/schemas';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import {
  fetchUserTrips,
  createTrip as apiCreateTrip,
  saveTrip as apiSaveTrip,
  deleteTrip as apiDeleteTrip,
  joinTripByCode,
  ensureShareCode as apiEnsureShareCode,
} from '../services/trip.service';
import { addMemberToTripChat } from '../services/chat.service';
import { fetchDestinationImage } from '../services/places.service';

const TripsContext = createContext(null);

const getToken = () => auth.currentUser?.getIdToken();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "9:30 AM" / "10:00 PM" → minutes since midnight for sorting. */
function parseActivityTimeToMinutes(timeStr) {
  if (!timeStr) return Infinity;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return Infinity;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ap = match[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TripsProvider({ children }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const pendingSave = useRef({});

  useEffect(() => {
    if (!user) {
      setTrips([]);
      setTripsLoading(false);
      return;
    }

    let cancelled = false;
    setTripsLoading(true);

    getToken()
      .then((token) => fetchUserTrips(token))
      .then((plainTrips) => {
        if (!cancelled) {
          setTrips(plainTrips.map((t) => new Trip(t)));
          setTripsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setTripsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  /**
   * Optimistically update one trip in local state, then persist to the backend.
   * Debounced 400 ms to batch rapid mutations (e.g. typing in a title).
   */
  const updateTrip = useCallback((tripId, updater) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t._id !== tripId) return t;
        const clone = new Trip(t.toJSON());
        updater(clone);
        clone.updatedAt = new Date().toISOString();

        clearTimeout(pendingSave.current[tripId]);
        pendingSave.current[tripId] = setTimeout(async () => {
          try {
            const token = await getToken();
            await apiSaveTrip(token, tripId, clone.toJSON());
          } catch (err) {
            console.error(err);
          }
        }, 400);

        return clone;
      }),
    );
  }, []);

  // ── Activity CRUD ────────────────────────────────────────────────────────────

  function addActivity(tripId, dayId, activityData) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (day) day.activities.push(new Activity(activityData));
    });
  }

  function removeActivity(tripId, dayId, activityId) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (day)
        day.activities = day.activities.filter((a) => a._id !== activityId);
    });
  }

  function markActivityDone(tripId, dayId, activityId) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (!day) return;
      const activity = day.activities.find((a) => a._id === activityId);
      if (activity) activity.status = 'done';
    });
  }

  function unmarkActivityDone(tripId, dayId, activityId) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (!day) return;
      const activity = day.activities.find((a) => a._id === activityId);
      if (activity) activity.status = 'planned';
    });
  }

  function updateActivityTime(tripId, dayId, activityId, time) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (!day) return;
      const activity = day.activities.find((a) => a._id === activityId);
      if (activity) {
        activity.time = time;
        day.activities.sort(
          (a, b) =>
            parseActivityTimeToMinutes(a.time) -
            parseActivityTimeToMinutes(b.time),
        );
      }
    });
  }

  /**
   * Add a per-person review to an activity.
   * Auto-marks the activity as done when a review is posted.
   */
  function addReview(tripId, dayId, activityId, reviewData) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (!day) return;
      const activity = day.activities.find((a) => a._id === activityId);
      if (!activity) return;
      activity.reviews.push(new ActivityReview(reviewData));
      if (activity.status !== 'done') activity.status = 'done';
    });
  }

  function deleteReview(tripId, dayId, activityId, reviewId) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (!day) return;
      const activity = day.activities.find((a) => a._id === activityId);
      if (!activity) return;
      activity.reviews = activity.reviews.filter((r) => r._id !== reviewId);
    });
  }

  function toggleReviewLike(tripId, dayId, activityId, reviewId, userId) {
    if (!userId) return;
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (!day) return;
      const activity = day.activities.find((a) => a._id === activityId);
      if (!activity) return;
      const review = activity.reviews.find((r) => r._id === reviewId);
      if (!review) return;
      if (!Array.isArray(review.likes)) review.likes = [];
      const idx = review.likes.indexOf(userId);
      if (idx === -1) review.likes.push(userId);
      else review.likes.splice(idx, 1);
    });
  }

  // ── Day mutations ────────────────────────────────────────────────────────────

  function updateDayTitle(tripId, dayId, title) {
    updateTrip(tripId, (trip) => {
      const day = trip.days.find((d) => d._id === dayId);
      if (day) day.title = title;
    });
  }

  function addDay(tripId) {
    updateTrip(tripId, (trip) => {
      const nextNum = trip.days.length + 1;
      trip.days.push(
        new Day({
          dayNum: nextNum,
          dayName: '',
          date: '',
          title: `Day ${nextNum}`,
        }),
      );
    });
  }

  // ── Budget mutations ─────────────────────────────────────────────────────────

  function updateBudget(tripId, budgetData) {
    updateTrip(tripId, (trip) => {
      Object.assign(trip.budget, budgetData);
    });
  }

  // ── Trip CRUD ────────────────────────────────────────────────────────────────

  function generateDaysFromRange(start, end) {
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const s = new Date(start + 'T00:00:00');
    const e = end ? new Date(end + 'T00:00:00') : s;
    const days = [];
    let cur = new Date(s);
    let num = 1;
    while (cur <= e) {
      days.push(
        new Day({
          dayNum: num,
          dayName: DAY_NAMES[cur.getDay()],
          date: `${MONTHS[cur.getMonth()]} ${cur.getDate()}`,
          title: `Day ${num}`,
        }),
      );
      cur.setDate(cur.getDate() + 1);
      num++;
    }
    return days;
  }

  async function createTrip({ title, destination, dateRange }) {
    if (!user) return;
    const days = dateRange?.start
      ? generateDaysFromRange(dateRange.start, dateRange.end)
      : [];
    const newTrip = new Trip({
      title: title || `Trip to ${destination.split(',')[0]}`,
      destination,
      dateRange: dateRange || {},
      image:
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80',
      status: 'planning',
      days,
    });

    // Optimistic insert with temp client-side ID
    setTrips((prev) => [newTrip, ...prev]);

    const token = await getToken();
    const saved = await apiCreateTrip(token, newTrip.toJSON());

    // Replace temp ID with the real MongoDB _id
    setTrips((prev) =>
      prev.map((t) => (t._id === newTrip._id ? new Trip(saved) : t)),
    );

    // Fetch a real destination image in the background
    fetchDestinationImage(destination)
      .then(async (imageUrl) => {
        if (!imageUrl) return;
        const t2 = await getToken();
        await apiSaveTrip(t2, saved._id, {
          image: imageUrl,
          coverImage: imageUrl,
        }).catch(console.error);
        setTrips((prev) =>
          prev.map((t) =>
            t._id === saved._id
              ? new Trip({
                  ...t.toJSON(),
                  image: imageUrl,
                  coverImage: imageUrl,
                })
              : t,
          ),
        );
      })
      .catch(console.error);

    return saved._id;
  }

  async function removeTrip(tripId) {
    setTrips((prev) => prev.filter((t) => t._id !== tripId));
    const token = await getToken();
    await apiDeleteTrip(token, tripId).catch(console.error);
  }

  async function joinTrip(code) {
    if (!user) throw new Error('not_authenticated');
    const token = await getToken();
    const tripId = await joinTripByCode(token, code);

    // Chat membership still lives in Firestore — best-effort
    addMemberToTripChat(tripId, user.uid).catch(console.error);

    // Refresh the trips list so the new trip shows up
    const freshToken = await getToken();
    const plainTrips = await fetchUserTrips(freshToken);
    setTrips(plainTrips.map((t) => new Trip(t)));

    return tripId;
  }

  async function ensureShareCode(tripId) {
    const token = await getToken();
    const code = await apiEnsureShareCode(token, tripId);
    setTrips((prev) =>
      prev.map((t) =>
        t._id === tripId && !t.shareCode
          ? new Trip({ ...t.toJSON(), shareCode: code })
          : t,
      ),
    );
    return code;
  }

  function updateDateRange(tripId, dateRange) {
    updateTrip(tripId, (trip) => {
      trip.dateRange = {
        start: dateRange.start ?? trip.dateRange.start,
        end: dateRange.end ?? trip.dateRange.end,
        label: dateRange.label ?? trip.dateRange.label,
      };
      if (dateRange.start) {
        const newDays = generateDaysFromRange(
          trip.dateRange.start,
          trip.dateRange.end,
        );
        trip.days = newDays.map((d, i) => {
          const existing = trip.days[i];
          if (existing) {
            d._id = existing._id;
            d.title = existing.title;
            d.activities = existing.activities;
          }
          return d;
        });
      }
    });
  }

  // ── Selectors ────────────────────────────────────────────────────────────────

  function getTripById(id) {
    return trips.find((t) => t._id === id) ?? null;
  }

  const upcomingTrips = trips
    .filter((t) => t.status !== 'completed')
    .sort((a, b) =>
      (a.dateRange.start ?? '').localeCompare(b.dateRange.start ?? ''),
    );

  const pastTrips = trips.filter((t) => t.status === 'completed');
  const nextTrip = upcomingTrips[0] ?? null;

  // ── Context value ─────────────────────────────────────────────────────────────

  const value = {
    trips,
    tripsLoading,
    upcomingTrips,
    pastTrips,
    nextTrip,
    addActivity,
    removeActivity,
    markActivityDone,
    unmarkActivityDone,
    updateActivityTime,
    addReview,
    deleteReview,
    toggleReviewLike,
    updateDayTitle,
    addDay,
    updateBudget,
    createTrip,
    removeTrip,
    joinTrip,
    ensureShareCode,
    updateDateRange,
    getTripById,
  };

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within a <TripsProvider>');
  return ctx;
}

export function useTrip(tripId) {
  const { getTripById } = useTrips();
  return getTripById(tripId);
}
