import { useState } from 'react';
import {
  ChevronRight,
  ImagePlus,
  Star,
  X,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
} from 'lucide-react';
import { useTrip, useTrips } from '../../context/TripContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Colored avatar circle with first letter of name */
function Avatar({ name, size = 28 }) {
  const COLORS = [
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-sky-400',
    'bg-violet-400',
    'bg-pink-400',
    'bg-teal-400',
    'bg-orange-400',
  ];
  const idx =
    name.charCodeAt(0) % COLORS.length;
  return (
    <div
      className={`${COLORS[idx]} rounded-full flex items-center justify-center shrink-0 text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          strokeWidth={1.5}
          className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}
        />
      ))}
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s === value ? 0 : s)} className="p-0.5">
          <Star
            size={22}
            strokeWidth={1.5}
            className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}
          />
        </button>
      ))}
    </div>
  );
}

// ─── ReviewItem ───────────────────────────────────────────────────────────────
function ReviewItem({ review, onDelete }) {
  return (
    <div className="flex gap-3">
      <Avatar name={review.userName} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-800">
              {review.userName}
            </span>
            {review.rating > 0 && <StarDisplay value={review.rating} />}
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-stone-300 active:text-red-400 shrink-0"
              aria-label="Delete review"
            >
              <Trash2 size={13} strokeWidth={2} />
            </button>
          )}
        </div>
        {review.comment ? (
          <p className="text-sm text-stone-600 mt-0.5 leading-snug">
            {review.comment}
          </p>
        ) : null}
        {review.photos && review.photos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {review.photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-16 h-16 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AddReviewForm ────────────────────────────────────────────────────────────
function AddReviewForm({ onSubmit, onCancel }) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);

  function handleSubmit() {
    if (!userName.trim()) return;
    onSubmit({ userName: userName.trim(), rating, comment, photos });
  }

  return (
    <div className="flex flex-col gap-3 bg-stone-50 rounded-2xl p-4 border border-stone-100">
      {/* Name */}
      <div>
        <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
          Your Name
        </p>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="e.g. Alex"
          className="w-full bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 outline-none"
        />
      </div>

      {/* Rating */}
      <div>
        <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
          Rating
        </p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div>
        <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
          Comment
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think?"
          rows={2}
          className="w-full bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 resize-none outline-none"
        />
      </div>

      {/* Photos */}
      <div>
        <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
          Photos
        </p>
        <div className="flex flex-wrap gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
              >
                <X size={9} className="text-white" />
              </button>
            </div>
          ))}
          <label className="w-16 h-16 rounded-xl bg-white border border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 cursor-pointer active:bg-stone-50">
            <ImagePlus size={16} className="text-stone-300" strokeWidth={1.5} />
            <span className="text-[0.55rem] text-stone-300 font-medium">Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                // TODO: replace URL.createObjectURL with S3/Cloudinary upload when backend is ready
                const urls = Array.from(e.target.files).map((f) =>
                  URL.createObjectURL(f),
                );
                setPhotos((p) => [...p, ...urls]);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-stone-100 text-sm font-semibold text-stone-500 active:bg-stone-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!userName.trim()}
          className="flex-1 py-2.5 rounded-xl bg-stone-900 text-sm font-semibold text-white active:bg-stone-700 disabled:opacity-40"
        >
          Post Review
        </button>
      </div>
    </div>
  );
}

// ─── MemoryCard ───────────────────────────────────────────────────────────────
function MemoryCard({ tripId, dayId, activity }) {
  const { addReview, deleteReview, markActivityDone, unmarkActivityDone } = useTrips();
  const isDone = activity.status === 'done';
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleAddReview(reviewData) {
    addReview(tripId, dayId, activity._id, reviewData);
    setShowForm(false);
  }

  function handleDeleteReview(reviewId) {
    deleteReview(tripId, dayId, activity._id, reviewId);
  }

  function handleToggleDone() {
    if (isDone) {
      unmarkActivityDone(tripId, dayId, activity._id);
    } else {
      markActivityDone(tripId, dayId, activity._id);
    }
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${
        isDone ? 'border-emerald-100 bg-emerald-50/40' : 'bg-stone-50 border-stone-100'
      }`}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-black/5"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isDone ? (
            <CheckCircle size={15} strokeWidth={2} className="text-emerald-500 shrink-0" />
          ) : (
            <Circle size={15} strokeWidth={1.8} className="text-stone-300 shrink-0" />
          )}
          <span className="text-sm font-semibold text-stone-800 truncate">
            {activity.name}
          </span>
          {activity.time ? (
            <span className="text-[11px] text-stone-400 shrink-0">{activity.time}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activity.reviews.length > 0 && (
            <span className="text-[11px] font-semibold text-stone-400">
              {activity.reviews.length} review{activity.reviews.length !== 1 ? 's' : ''}
            </span>
          )}
          <ChevronRight
            size={15}
            strokeWidth={2.2}
            className={`text-stone-300 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-stone-100 pt-3">
          {/* Reviews list */}
          {activity.reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activity.reviews.map((review) => (
                <ReviewItem
                  key={review._id}
                  review={review}
                  onDelete={() => handleDeleteReview(review._id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-300 text-center py-2">
              No reviews yet — be the first to leave one!
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-stone-100" />

          {/* Add review / form toggle */}
          {showForm ? (
            <AddReviewForm
              onSubmit={handleAddReview}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 border border-dashed border-stone-200 rounded-xl py-2.5 text-sm text-stone-400 active:bg-stone-100"
            >
              <Plus size={14} strokeWidth={2} />
              Add your review
            </button>
          )}

          {/* Mark as Done toggle (separate from reviews) */}
          <button
            onClick={handleToggleDone}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isDone
                ? 'bg-stone-100 text-stone-500 active:bg-stone-200'
                : 'bg-emerald-500 text-white active:bg-emerald-600'
            }`}
          >
            {isDone ? 'Mark as Not Done' : 'Mark as Done'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DaySection ───────────────────────────────────────────────────────────────
function DaySection({ tripId, day, isOpen, onToggle, onAddMemory }) {
  const completedCount = day.activities.filter((a) => a.status === 'done').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-stone-50"
      >
        <ChevronRight
          size={17}
          strokeWidth={2.2}
          className={`text-stone-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider">
            Day {day.dayNum} · {day.dayName} · {day.date}
          </span>
          <span className="text-sm font-semibold text-stone-900 mt-0.5">
            {day.title}
          </span>
        </div>
        {day.activities.length > 0 && (
          <span className="text-[0.65rem] font-semibold text-stone-400 shrink-0">
            {completedCount}/{day.activities.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-stone-50">
          {day.activities.length === 0 ? (
            <p className="text-xs text-stone-300 text-center py-3">
              No activities planned for this day yet. Add some in the Itinerary tab.
            </p>
          ) : (
            day.activities.map((act) => (
              <MemoryCard
                key={act._id}
                tripId={tripId}
                dayId={day._id}
                activity={act}
              />
            ))
          )}

          <button
            onClick={() => onAddMemory(day._id)}
            className="flex items-center justify-center gap-2 border border-dashed border-stone-200 rounded-xl py-2.5 text-sm text-stone-400 active:bg-stone-50 mt-1"
          >
            <Plus size={14} strokeWidth={2} />
            Add spontaneous memory
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MemoriesTab ──────────────────────────────────────────────────────────────
export default function MemoriesTab({ tripId }) {
  const trip = useTrip(tripId);
  const { addActivity } = useTrips();
  const [openDays, setOpenDays] = useState({});

  if (!trip) return null;

  function toggle(id) {
    setOpenDays((p) => ({ ...p, [id]: !p[id] }));
  }

  function handleAddMemory(dayId) {
    addActivity(tripId, dayId, {
      name: 'New memory',
      type: 'custom',
      status: 'planned',
    });
    setOpenDays((p) => ({ ...p, [dayId]: true }));
  }

  if (trip.days.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-stone-300">No days found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {trip.days.map((day) => (
        <DaySection
          key={day._id}
          tripId={tripId}
          day={day}
          isOpen={!!openDays[day._id]}
          onToggle={() => toggle(day._id)}
          onAddMemory={handleAddMemory}
        />
      ))}
    </div>
  );
}
