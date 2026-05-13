import { useState } from 'react';
import TripsHeader from '../components/trips/TripsHeader';
import TripsList from '../components/trips/TripsList';
import NewTripDrawer from '../components/trips/NewTripDrawer';

export default function MyTripsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-full bg-[#FAFAF8]">
      <div className="fixed top-0 left-0 right-0 z-11">
        <TripsHeader onNewTrip={() => setDrawerOpen(true)} />
      </div>
      <div className="pt-[72px]">
        <TripsList />
      </div>
      <NewTripDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
