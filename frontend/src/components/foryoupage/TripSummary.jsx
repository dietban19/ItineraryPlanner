import ExploreButton from './ExploreButton';

export default function TripSummary({ itinerary }) {
  return (
    <section className="absolute bottom-6 left-5 right-24 z-20">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">
        {itinerary.title}
      </h1>
      <p className="mt-2 text-sm text-white/90">{itinerary.creator}</p>
      <p className="mt-3 text-sm text-white/90">
        {itinerary.tags.join('  •  ')}
      </p>
      <ExploreButton />
    </section>
  );
}
