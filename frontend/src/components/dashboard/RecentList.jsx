function RecentItem() {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-stone-100 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-stone-100" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-24 rounded bg-stone-100" />
        <div className="h-2.5 w-16 rounded bg-stone-100" />
      </div>
    </div>
  );
}

export default function RecentList({ items = [1, 2, 3] }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-stone-500 mb-3">Recent</h2>
      <div className="space-y-2">
        {items.map((_, i) => (
          <RecentItem key={i} />
        ))}
      </div>
    </section>
  );
}
