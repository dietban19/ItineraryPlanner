function BackgroundMedia({ image }) {
  return (
    <>
      <img
        src={image}
        alt="Santorini sunset itinerary preview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/75" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent" />
    </>
  );
}

export default BackgroundMedia;
