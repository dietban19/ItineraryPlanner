import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ImagePlus,
  Star,
  X,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Loader,
  Heart,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { useTrip, useTrips } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../services/upload.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ name = '?', size = 28 }) {
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
  const idx = name.charCodeAt(0) % COLORS.length;
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
          size={11}
          strokeWidth={1.5}
          className={
            s <= value ? 'text-amber-400 fill-amber-400' : 'text-white/30'
          }
        />
      ))}
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s === value ? 0 : s)}
          className="p-0.5"
        >
          <Star
            size={22}
            strokeWidth={1.5}
            className={
              s <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
            }
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// ─── AddReviewSheet (bottom-sheet modal) ──────────────────────────────────────

function AddReviewSheet({ userName, userId, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoItems, setPhotoItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  function handleClose() {
    setEntered(false);
    setTimeout(onClose, 280);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const uploadedUrls = await Promise.all(
        photoItems.map(async (item) => {
          try {
            return await uploadImage(item.file);
          } catch {
            return item.localUrl;
          }
        }),
      );
      onSubmit({
        userName,
        userId,
        rating,
        comment,
        photos: uploadedUrls,
        addedAt: new Date().toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e) {
    const newItems = Array.from(e.target.files).map((file) => ({
      localUrl: URL.createObjectURL(file),
      file,
    }));
    setPhotoItems((p) => [...p, ...newItems]);
    e.target.value = '';
  }

  function removePhoto(i) {
    setPhotoItems((p) => {
      URL.revokeObjectURL(p[i].localUrl);
      return p.filter((_, j) => j !== i);
    });
  }

  return (
    <div className="fixed inset-0 z-70 flex flex-col justify-end">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sheet */}
      <div
        className={`relative flex flex-col bg-white rounded-t-[28px] shadow-2xl max-h-[90vh] transition-transform duration-300 ease-out ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 pb-8 pt-2 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={userName} size={30} />
              <span className="text-sm font-semibold text-stone-800">
                {userName}
              </span>
            </div>
            <button onClick={handleClose} className="p-1 text-stone-400">
              <X size={18} />
            </button>
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
              rows={3}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 resize-none outline-none"
            />
          </div>

          {/* Photos */}
          <div>
            <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Photos
            </p>
            <div className="flex flex-wrap gap-2">
              {photoItems.map((item, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden"
                >
                  <img
                    src={item.localUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl bg-stone-50 border border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 cursor-pointer active:bg-stone-100">
                <ImagePlus
                  size={18}
                  className="text-stone-300"
                  strokeWidth={1.5}
                />
                <span className="text-[0.6rem] text-stone-300 font-medium">
                  Add
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-stone-900 text-sm font-semibold text-white active:bg-stone-700 disabled:opacity-40 flex items-center justify-center gap-2 mt-1"
          >
            {submitting ? (
              <>
                <Loader size={14} className="animate-spin" /> Posting...
              </>
            ) : (
              'Post Memory'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ReviewsViewer (full-screen Instagram-style) ──────────────────────────────

// Inner component so photoIndex resets automatically when `reviewKey` changes
function ReviewSlide({
  photos,
  gradient,
  review,
  isLiked,
  likeCount,
  currentUserId,
  onLike,
  onDelete,
  reviewCount,
  reviewIndex,
  onSetIndex,
  activityName,
  onClose,
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);

  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartY.current = null;
    touchStartX.current = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -50 && photoIndex < photos.length - 1)
        setPhotoIndex((i) => i + 1);
      else if (dx > 50 && photoIndex > 0) setPhotoIndex((i) => i - 1);
    } else {
      if (dy < -60 && reviewIndex < reviewCount - 1)
        onSetIndex(reviewIndex + 1);
      else if (dy > 60 && reviewIndex > 0) onSetIndex(reviewIndex - 1);
    }
  }

  return (
    <div
      className="absolute inset-0 flex flex-col select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 overflow-hidden">
        {photos.length > 0 ? (
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{
              width: `${photos.length * 100}%`,
              transform: `translateX(${-photoIndex * (100 / photos.length)}%)`,
            }}
          >
            {photos.map((src, i) => (
              <div
                key={i}
                className="relative h-full shrink-0"
                style={{ width: `${100 / photos.length}%` }}
              >
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`h-full w-full bg-linear-to-b ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-12 pb-2 shrink-0">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={19} strokeWidth={2} />
        </button>
        <p className="flex-1 text-white font-semibold text-sm line-clamp-1">
          {activityName}
        </p>
        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 shrink-0">
          <MessageCircle size={13} className="text-white/70" />
          <span className="text-white/70 text-xs font-medium">
            {reviewCount}
          </span>
        </div>
      </div>

      {/* ── Photo dots ── */}
      {photos.length > 1 && (
        <div className="relative z-10 flex justify-center gap-1 py-1 shrink-0">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-200 ${i === photoIndex ? 'w-5 bg-white' : 'w-1 bg-white/40'}`}
            />
          ))}
        </div>
      )}

      {/* ── Review nav dots ── */}
      {reviewCount > 1 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5">
          {Array.from({ length: reviewCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSetIndex(i)}
              className={`rounded-full transition-all duration-200 ${i === reviewIndex ? 'h-5 w-1.5 bg-white' : 'h-1.5 w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}

      {/* ── Bottom content ── */}
      <div className="relative z-10 mt-auto px-4 pb-12 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar name={review.userName} size={38} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-none">
              {review.userName}
            </p>
            <p className="text-white/50 text-xs mt-0.5">
              {timeAgo(review.addedAt)}
            </p>
          </div>
          {review.rating > 0 && (
            <div className="bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 shrink-0">
              <StarDisplay value={review.rating} />
            </div>
          )}
        </div>
        {review.comment ? (
          <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-5">
            {review.comment}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <button
            onClick={onLike}
            className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 active:scale-95 transition-transform"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={18}
              strokeWidth={2}
              className={`transition-colors duration-150 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
            />
            {likeCount > 0 && (
              <span
                className={`text-sm font-semibold ${isLiked ? 'text-rose-400' : 'text-white'}`}
              >
                {likeCount}
              </span>
            )}
          </button>
          {review.userId === currentUserId && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 text-white/60 active:text-red-400"
              aria-label="Delete memory"
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsViewer({ activity, tripId, dayId, currentUserId, onClose }) {
  const { toggleReviewLike, deleteReview } = useTrips();
  const reviews = activity.reviews;
  const [index, setIndex] = useState(0);
  const [entered, setEntered] = useState(false);

  const review = reviews[index];

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  function handleClose() {
    setEntered(false);
    setTimeout(onClose, 300);
  }

  if (!review) return null;

  const GRADIENTS = [
    'from-rose-900 via-rose-800 to-pink-900',
    'from-sky-900 via-blue-800 to-indigo-900',
    'from-emerald-900 via-teal-800 to-cyan-900',
    'from-amber-900 via-orange-800 to-red-900',
    'from-violet-900 via-purple-800 to-fuchsia-900',
  ];

  return (
    <div
      className={`fixed inset-0 z-70 bg-black transition-opacity duration-300 ${entered ? 'opacity-100' : 'opacity-0'}`}
    >
      <ReviewSlide
        key={index}
        photos={review.photos ?? []}
        gradient={GRADIENTS[index % GRADIENTS.length]}
        review={review}
        isLiked={
          Array.isArray(review.likes) && review.likes.includes(currentUserId)
        }
        likeCount={review.likes?.length ?? 0}
        currentUserId={currentUserId}
        onLike={() => {
          if (currentUserId)
            toggleReviewLike(
              tripId,
              dayId,
              activity._id,
              review._id,
              currentUserId,
            );
        }}
        onDelete={() => {
          deleteReview(tripId, dayId, activity._id, review._id);
          if (index >= reviews.length - 1 && index > 0) setIndex((i) => i - 1);
        }}
        reviewCount={reviews.length}
        reviewIndex={index}
        onSetIndex={setIndex}
        activityName={activity.name}
        onClose={handleClose}
      />
    </div>
  );
}

// ─── MemoryCard ───────────────────────────────────────────────────────────────
function MemoryCard({
  tripId,
  dayId,
  activity,
  currentUserName,
  currentUserId,
}) {
  const { markActivityDone, unmarkActivityDone, addReview } = useTrips();
  const isDone = activity.status === 'done';
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  function handleAddReview(reviewData) {
    addReview(tripId, dayId, activity._id, reviewData);
    setShowAddForm(false);
  }

  function handleToggleDone() {
    if (isDone) unmarkActivityDone(tripId, dayId, activity._id);
    else markActivityDone(tripId, dayId, activity._id);
  }

  return (
    <>
      <div
        className={`rounded-2xl overflow-hidden border ${
          isDone
            ? 'border-emerald-100 bg-emerald-50/40'
            : 'bg-stone-50 border-stone-100'
        }`}
      >
        {/* Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-black/5"
        >
          <div className="flex items-center gap-2 min-w-0">
            {isDone ? (
              <CheckCircle
                size={15}
                strokeWidth={2}
                className="text-emerald-500 shrink-0"
              />
            ) : (
              <Circle
                size={15}
                strokeWidth={1.8}
                className="text-stone-300 shrink-0"
              />
            )}
            <span className="text-sm font-semibold text-stone-800 truncate">
              {activity.name}
            </span>
            {activity.time ? (
              <span className="text-[11px] text-stone-400 shrink-0">
                {activity.time}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activity.reviews.length > 0 && (
              <span className="text-[11px] font-semibold text-stone-400">
                {activity.reviews.length} memor
                {activity.reviews.length !== 1 ? 'ies' : 'y'}
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
          <div className="px-4 pb-4 flex flex-col gap-2.5 border-t border-stone-100 pt-3">
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-900 text-sm font-semibold text-white active:bg-stone-700"
              >
                <Plus size={14} strokeWidth={2.5} />
                Add Memory
              </button>

              <button
                onClick={() => setShowReviews(true)}
                disabled={activity.reviews.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-100 text-sm font-semibold text-stone-600 active:bg-stone-200 disabled:opacity-40"
              >
                <Heart size={14} strokeWidth={2} />
                {activity.reviews.length > 0
                  ? `See Memories (${activity.reviews.length})`
                  : 'No Memories'}
              </button>
            </div>

            {/* Mark as Done */}
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

      {showAddForm && (
        <AddReviewSheet
          userName={currentUserName}
          userId={currentUserId}
          onSubmit={handleAddReview}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showReviews && activity.reviews.length > 0 && (
        <ReviewsViewer
          activity={activity}
          tripId={tripId}
          dayId={dayId}
          currentUserId={currentUserId}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
}

// ─── DaySection ───────────────────────────────────────────────────────────────
function DaySection({
  tripId,
  day,
  isOpen,
  onToggle,
  onAddMemory,
  currentUserName,
  currentUserId,
}) {
  const completedCount = day.activities.filter(
    (a) => a.status === 'done',
  ).length;

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
              No activities planned for this day yet. Add some in the Itinerary
              tab.
            </p>
          ) : (
            day.activities.map((act) => (
              <MemoryCard
                key={act._id}
                tripId={tripId}
                dayId={day._id}
                activity={act}
                currentUserName={currentUserName}
                currentUserId={currentUserId}
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
  const { user, userProfile } = useAuth();
  const [openDays, setOpenDays] = useState({});

  const currentUserId = user?.uid ?? null;
  const currentUserName =
    userProfile?.displayName ?? user?.displayName ?? 'Anonymous';

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
          currentUserName={currentUserName}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
