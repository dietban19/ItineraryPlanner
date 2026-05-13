export default function Avatar({ src }) {
  return (
    <button className="h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-white/20 shadow-lg">
      <img
        src={src}
        alt="Creator profile"
        className="h-full w-full object-cover"
      />
    </button>
  );
}
