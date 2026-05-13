import BackgroundMedia from './BackgroundMedia';
import SideActions from './SideActions';
import TopTabs from './TopTabs';
import TripSummary from './TripSummary';

export default function ItineraryStory({ itinerary }) {
  return (
    <article className="relative h-full w-full overflow-hidden text-white">
      <BackgroundMedia image={itinerary.backgroundImage} />
      <TopTabs />
      <SideActions itinerary={itinerary} />
      <TripSummary itinerary={itinerary} />
    </article>
  );
}
