import ItineraryStory from '../components/foryoupage/ItineraryStory';

const SAMPLE_ITINERARY = {
  backgroundImage: './santorini.png',
  title: '5 Days in Santorini',
  creator: '@travelwith_maya',
  tags: ['Greece', 'Island', 'Summer'],
  avatar: 'profile.png',
  likes: '14.2k',
  comments: '832',
  saves: '5.1k',
  shares: '2.3k',
};

export default function ForYouPage() {
  return (
    <div className="flex flex-col flex-1">
      <ItineraryStory itinerary={SAMPLE_ITINERARY} />
    </div>
  );
}
