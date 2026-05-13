import { MapIcon } from 'lucide-react';

export default function ExploreButton() {
  return (
    <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition active:scale-95">
      <MapIcon size={18} />
      Explore itinerary
    </button>
  );
}
