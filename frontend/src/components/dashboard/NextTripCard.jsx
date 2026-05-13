export default function NextTripCard({ trip = null }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-stone-500 mb-3">Next trip</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
        {trip ? (
          <p className="text-stone-700 text-sm">{trip.name}</p>
        ) : (
          <p className="text-stone-300 text-sm text-center py-4">
            No upcoming trips yet
          </p>
        )}
      </div>
    </section>
  );
}
