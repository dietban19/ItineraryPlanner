export default function StatusBar() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-8 pt-5 text-sm font-semibold">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-0.5">
          <span className="h-1.5 w-1 rounded-full bg-white" />
          <span className="h-2.5 w-1 rounded-full bg-white" />
          <span className="h-3.5 w-1 rounded-full bg-white" />
          <span className="h-4.5 w-1 rounded-full bg-white" />
        </div>
        <span className="text-xs">⌁</span>
        <div className="h-3.5 w-6 rounded-[4px] border border-white/80 p-0.5">
          <div className="h-full w-4 rounded-[2px] bg-white" />
        </div>
      </div>
    </header>
  );
}
