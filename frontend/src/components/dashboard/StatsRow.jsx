function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-stone-800">{value}</p>
    </div>
  );
}

export default function StatsRow({ upcoming = 0, past = 0 }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Upcoming trips" value={upcoming} />
      <StatCard label="Past trips" value={past} />
    </div>
  );
}
