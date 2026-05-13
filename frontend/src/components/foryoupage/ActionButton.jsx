export default function ActionButton({ icon, label }) {
  return (
    <button className="flex flex-col items-center gap-1 text-white drop-shadow-md">
      <span className="flex h-8 w-8 items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
