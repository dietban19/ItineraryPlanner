import { MoreHorizontal } from 'lucide-react';

export default function TripCard({ trip, onPress }) {
  return (
    <div
      onClick={onPress}
      className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Background image */}
      <img
        src={trip.image}
        alt={trip.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

      {/* Top-right menu button */}
      <button
        className="absolute top-3 right-3 z-10 bg-black/30 backdrop-blur-sm rounded-full p-1.5 text-white"
        aria-label="Trip options"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>

      {/* Status badge */}
      {trip.status === 'ongoing' && (
        <div className="absolute top-3 left-3 z-10 bg-emerald-500/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-[11px] font-semibold">
          Ongoing
        </div>
      )}

      {/* Bottom-left text */}
      <div className="absolute bottom-4 left-4 z-10">
        <p className="text-white text-xl font-bold leading-tight drop-shadow font-display">
          {trip.title}
        </p>
        <p className="text-white/75 text-sm mt-0.5 drop-shadow">
          {trip.destination}
          {trip.dateRange.label ? ` · ${trip.dateRange.label}` : ''}
        </p>
      </div>
    </div>
  );
}
