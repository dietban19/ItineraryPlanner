export default function QuickTestInput() {
  return (
    <section>
      <h2 className="text-sm font-medium text-stone-500 mb-3">Quick test</h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <input
          type="text"
          placeholder="Type anything here"
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 outline-none focus:border-stone-400"
        />
      </div>
    </section>
  );
}
