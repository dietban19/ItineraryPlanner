import PhoneFrame from './PhoneFrame';
import ItineraryStory from './ItineraryStory';

const SAMPLE_ITINERARY = {
  backgroundImage:
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500&q=80',
  title: '5 Days in Santorini',
  creator: '@travelwith_maya',
  tags: ['Greece', 'Island', 'Summer'],
  avatar: 'https://i.pravatar.cc/56?img=5',
  likes: '14.2k',
  comments: '832',
  saves: '5.1k',
  shares: '2.3k',
};

export default function ForYouPage() {
  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center">
      <PhoneFrame>
        <ItineraryStory itinerary={SAMPLE_ITINERARY} />
      </PhoneFrame>
    </main>
  );
}
