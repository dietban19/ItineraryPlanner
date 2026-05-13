export default function TopTabs() {
  return (
    <nav className="absolute left-0 right-0 top-6 z-20 flex justify-center gap-12 text-sm font-semibold drop-shadow-sm">
      <button className="flex flex-col items-center gap-2 text-white">
        <span>For You</span>
        <span className="h-0.5 w-8 rounded-full bg-white" />
      </button>
      <button className="text-white/55">Following</button>
    </nav>
  );
}
