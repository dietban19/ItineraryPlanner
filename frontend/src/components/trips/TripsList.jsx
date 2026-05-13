import { useNavigate } from 'react-router-dom';
import TripCard from './TripCard';
import { useTrips } from '../../context/TripContext';

function TripsList() {
  const navigate = useNavigate();
  const { trips } = useTrips();

  return (
    <div className="p-4 space-y-4">
      {trips.map((trip) => (
        <TripCard
          key={trip._id}
          trip={trip}
          onPress={() =>
            navigate(`/trips/${trip._id}`, { state: { tripId: trip._id } })
          }
        />
      ))}
    </div>
  );
}

export default TripsList;
