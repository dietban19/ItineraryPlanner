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
import {
  subscribeToUserTrips,
  createTrip as firestoreCreateTrip,
  saveTrip,
  deleteTrip as firestoreDeleteTrip,
  joinTripByCode,
  ensureShareCode as firestoreEnsureShareCode,
} from '../services/trip.service';
import { fetchDestinationImage } from '../services/places.service';

const TripsContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TripsProvider({ children }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const pendingSave = useRef({});

  // Subscribe to the current user's trips in Firestore
  useEffect(() => {
    if (!user) {
      setTrips([]);
      setTripsLoading(false);
      return;
    }

    setTripsLoading(true);
    const unsubscribe = subscribeToUserTrips(user.uid, (plainTrips) => {
      setTrips(plainTrips.map((t) => new Trip(t)));
      setTripsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  /**
   * Optimistically update one trip in local state, then persist to Firestore.
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
        pendingSave.current[tripId] = setTimeout(() => {
          saveTrip(tripId, clone.toJSON()).catch(console.error);
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
      if (activity) activity.time = time;
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
      // Auto-mark done when the first review is posted
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

  /** Create a new trip in Firestore and optimistically add to local state. */
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

    // Optimistic update — onSnapshot will reconcile the real ID
    setTrips((prev) => [newTrip, ...prev]);

    const docId = await firestoreCreateTrip(user.uid, newTrip.toJSON());
    // Patch local state with the real Firestore document ID
    setTrips((prev) =>
      prev.map((t) =>
        t._id === newTrip._id ? new Trip({ ...t.toJSON(), _id: docId }) : t,
      ),
    );

    // Fetch a real destination image from Google Places in background and save it
    fetchDestinationImage(destination)
      .then((imageUrl) => {
        if (!imageUrl) return;
        saveTrip(docId, { image: imageUrl, coverImage: imageUrl }).catch(
          console.error,
        );
        setTrips((prev) =>
          prev.map((t) =>
            t._id === docId
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

    return docId;
  }

  /** Remove a trip from local state and Firestore, and unlink it from the user doc. */
  async function removeTrip(tripId) {
    setTrips((prev) => prev.filter((t) => t._id !== tripId));
    await firestoreDeleteTrip(tripId, user?.uid).catch(console.error);
  }

  /**
   * Join a trip by its share code.
   * Adds the trip to this user's list and increments the people count.
   * @param {string} code
   * @returns {Promise<void>}
   * @throws {Error} 'not_found' | 'already_member'
   */
  async function joinTrip(code) {
    if (!user) throw new Error('not_authenticated');
    const tripId = await joinTripByCode(code, user.uid);
    // onSnapshot will pick up the new trip automatically
    return tripId;
  }

  /**
   * Ensures a trip has a share code. Generates and persists one on-demand if
   * the trip was created before share codes were introduced.
   * Patches local state so the UI updates without waiting for onSnapshot.
   * @param {string} tripId
   * @returns {Promise<string>} The share code
   */
  async function ensureShareCode(tripId) {
    const code = await firestoreEnsureShareCode(tripId);
    setTrips((prev) =>
      prev.map((t) =>
        t._id === tripId && !t.shareCode
          ? new Trip({ ...t.toJSON(), shareCode: code })
          : t,
      ),
    );
    return code;
  }

  /** Update the date range of a trip, regenerating days if the range changed. */
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
        // Re-use existing day _ids / activities where the day index matches
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

  /** Trips sorted ascending by start date */
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

/**
 * Convenience hook for a single trip.
 * Returns null if the trip is not found.
 */
export function useTrip(tripId) {
  const { getTripById } = useTrips();
  return getTripById(tripId);
}
