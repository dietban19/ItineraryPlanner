import { Plus } from 'lucide-react';

function TripsHeader({ onNewTrip }) {
  return (
    <header className="px-5 pt-2 pb-4 bg-white border-b border-stone-100 flex items-center justify-between">
      <span className="text-3xl font-bold text-stone-900 font-display">
        Trips
      </span>
      <button
        onClick={onNewTrip}
        className="flex items-center gap-1.5 bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-full active:scale-95 transition-transform"
      >
        <Plus size={16} strokeWidth={2.5} />
        New Trip
      </button>
    </header>
  );
}

export default TripsHeader;
