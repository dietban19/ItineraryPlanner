/**
 * Frontend model schemas — shaped to mirror future Mongoose schemas.
 *
 * Mongo collection: "trips"
 * Each Trip embeds Days which embed Activities.
 *
 * All _id fields are client-side UUIDs on the frontend.
 * When the backend is wired up, the server will replace them with MongoDB ObjectIds.
 */

/** Generates a temporary client-side ID */
function cid() {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ─── ActivityReview ──────────────────────────────────────────────────────────
/**
 * Subdocument: one person's review of a completed activity.
 * Multiple people on a trip can each add their own review.
 *
 * Mongoose equivalent:
 *   _id:      ObjectId
 *   userId:   ObjectId  (ref: 'User') — null until auth wired
 *   userName: String
 *   photos:   [String]  // S3 / Cloudinary URLs (upload on backend)
 *   rating:   Number    // 0–5
 *   comment:  String
 *   addedAt:  Date
 */
export class ActivityReview {
  constructor({
    _id,
    userId = null,
    userName = 'Anonymous',
    photos = [],
    rating = 0,
    comment = '',
    addedAt = null,
    likes = [],
  } = {}) {
    this._id = _id ?? cid();
    this.userId = userId; // null until auth is wired
    this.userName = userName; // Display name
    this.photos = photos; // Array<string> — image URLs
    this.rating = rating; // 0–5 star rating
    this.comment = comment; // Review text
    this.addedAt = addedAt ?? new Date().toISOString();
    this.likes = likes; // Array<string> — userIds who liked this review
  }
}

// ─── Activity ─────────────────────────────────────────────────────────────────
/**
 * Subdocument: a single planned or completed activity within a day.
 *
 * Mongoose equivalent:
 *   _id:     ObjectId
 *   name:    String   (required)
 *   time:    String   // display string e.g. '9:00 AM'
 *   image:   String   // cover URL
 *   rating:  Number   // external/suggested rating (e.g. Google Places)
 *   type:    String   // enum: 'activity' | 'restaurant' | 'custom'
 *   status:  String   // enum: 'planned' | 'done' | 'skipped'
 *   reviews: [ActivityReview]
 */
export class Activity {
  constructor({
    _id,
    name,
    time = '',
    image = '',
    rating = null,
    placeId = null,
    type = 'activity',
    status = 'planned',
    reviews = [],
  } = {}) {
    this._id = _id ?? cid();
    this.name = name;
    this.time = time;
    this.image = image;
    this.rating = rating; // External rating (e.g. 4.9 from Google) — nullable
    this.placeId = placeId; // Google Place ID for fetching details — nullable
    this.type = type; // 'activity' | 'restaurant' | 'custom'
    this.status = status; // 'planned' | 'done' | 'skipped'
    this.reviews = reviews.map((r) =>
      r instanceof ActivityReview ? r : new ActivityReview(r),
    );
  }

  static create(data) {
    return new Activity(data);
  }
}

// ─── Day ──────────────────────────────────────────────────────────────────────
/**
 * Subdocument: a single day of the trip.
 *
 * Mongoose equivalent:
 *   _id:        ObjectId
 *   dayNum:     Number   // 1-based index
 *   dayName:    String   // 'Mon', 'Tue', …
 *   date:       String   // display string e.g. 'Jun 12'
 *   title:      String   // user-editable day label
 *   activities: [Activity]
 */
export class Day {
  constructor({ _id, dayNum, dayName, date, title, activities = [] } = {}) {
    this._id = _id ?? cid();
    this.dayNum = dayNum;
    this.dayName = dayName; // Short day name: 'Mon', 'Tue', …
    this.date = date; // Display string: 'Jun 12'
    this.title = title ?? `Day ${dayNum}`;
    this.activities = activities.map((a) =>
      a instanceof Activity ? a : new Activity(a),
    );
  }

  static create(data) {
    return new Day(data);
  }
}

// ─── Budget ───────────────────────────────────────────────────────────────────
/**
 * Subdocument: trip budget tracking.
 *
 * Mongoose equivalent:
 *   total:    Number
 *   used:     Number
 *   currency: String  // ISO 4217 e.g. 'USD'
 */
export class Budget {
  constructor({ total = 0, used = 0, currency = 'USD' } = {}) {
    this.total = total;
    this.used = used;
    this.currency = currency;
  }

  /** Percentage of budget consumed (0–100) */
  get percent() {
    return this.total > 0 ? Math.round((this.used / this.total) * 100) : 0;
  }
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
/**
 * Root document: a single trip.
 *
 * Mongoose equivalent:
 *   _id:        ObjectId
 *   userId:     ObjectId  (ref: 'User') — null until auth wired
 *   title:      String
 *   destination:String
 *   dateRange: {
 *     start:    Date      // ISO date
 *     end:      Date      // ISO date
 *     label:    String    // Human-readable e.g. 'Jun 12 – 16'
 *   }
 *   people:     Number
 *   image:      String    // Hero image URL
 *   coverImage: String    // Card cover URL (defaults to image)
 *   budget:     Budget
 *   days:       [Day]
 *   status:     String    // enum: 'planning' | 'ongoing' | 'completed'
 *   createdAt:  Date
 *   updatedAt:  Date
 */
export class Trip {
  constructor({
    _id,
    userId = null,
    title,
    destination,
    dateRange = {},
    people = 1,
    image = '',
    coverImage = '',
    budget = {},
    days = [],
    status = 'planning',
    shareCode = null,
    memberIds = [],
    createdAt,
    updatedAt,
  } = {}) {
    this._id = _id ?? cid();
    this.userId = userId; // null until auth is wired to backend
    this.title = title;
    this.destination = destination;
    this.dateRange = {
      start: dateRange.start ?? null, // ISO date string e.g. '2026-06-12'
      end: dateRange.end ?? null, // ISO date string e.g. '2026-06-16'
      label: dateRange.label ?? '', // Display string e.g. 'Jun 12 – 16'
    };
    this.people = people;
    this.image = image;
    this.coverImage = coverImage || image;
    this.budget = budget instanceof Budget ? budget : new Budget(budget);
    this.days = days.map((d) => (d instanceof Day ? d : new Day(d)));
    this.status = status; // 'planning' | 'ongoing' | 'completed'
    this.shareCode = shareCode; // 8-char invite code, null until generated
    this.memberIds = memberIds; // array of Firebase UIDs
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? new Date().toISOString();
  }

  // ── Computed getters ────────────────────────────────────────────────────────

  get totalDays() {
    return this.days.length;
  }

  get totalActivities() {
    return this.days.reduce((sum, d) => sum + d.activities.length, 0);
  }

  get completedActivities() {
    return this.days.reduce(
      (sum, d) => sum + d.activities.filter((a) => a.status === 'done').length,
      0,
    );
  }

  /**
   * Trip Energy: percentage of planned activities that have been completed.
   * Drives the Trip Energy progress bar in the Overview tab.
   */
  get tripEnergy() {
    if (this.totalActivities === 0) return 0;
    return Math.round((this.completedActivities / this.totalActivities) * 100);
  }

  // ── Serialization ───────────────────────────────────────────────────────────

  /**
   * Returns a plain JSON-safe object ready for a future API POST/PUT.
   * Computed getters are excluded — the backend recalculates them.
   */
  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      title: this.title,
      destination: this.destination,
      dateRange: { ...this.dateRange },
      people: this.people,
      image: this.image,
      coverImage: this.coverImage,
      budget: {
        total: this.budget.total,
        used: this.budget.used,
        currency: this.budget.currency,
      },
      days: this.days.map((d) => ({
        _id: d._id,
        dayNum: d.dayNum,
        dayName: d.dayName,
        date: d.date,
        title: d.title,
        activities: d.activities.map((a) => ({
          _id: a._id,
          name: a.name,
          time: a.time,
          image: a.image,
          rating: a.rating,
          placeId: a.placeId,
          type: a.type,
          status: a.status,
          reviews: a.reviews.map((r) => ({
            _id: r._id,
            userId: r.userId,
            userName: r.userName,
            photos: r.photos,
            rating: r.rating,
            comment: r.comment,
            addedAt: r.addedAt,
          })),
        })),
      })),
      status: this.status,
      shareCode: this.shareCode,
      memberIds: this.memberIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static create(data) {
    return new Trip(data);
  }
}
