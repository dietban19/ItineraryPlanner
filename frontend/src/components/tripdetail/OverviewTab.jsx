import { Zap, Wallet, ChevronRight } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import WeatherCard from './WeatherCard';
import PrayerTimesCard from './PrayerTimesCard';

export default function OverviewTab({ tripId }) {
  const trip = useTrip(tripId);
  if (!trip) return null;

  const tripEnergy = trip.tripEnergy;
  const totalDays = trip.totalDays;
  const totalActivities = trip.totalActivities;
  const completedActivities = trip.completedActivities;
  const budgetPercent = trip.budget.percent;
  const budgetUsed = trip.budget.used;
  const budgetTotal = trip.budget.total;

  const energyHelperText =
    totalActivities === 0
      ? 'Add activities to your itinerary to track progress.'
      : tripEnergy === 100
        ? `All ${totalActivities} activities completed!`
        : `${completedActivities} of ${totalActivities} activities completed`;

  // TODO: Replace with actual prayer times data from backend (Aladhan API)
  const prayerTimes = {
    timings: {
      Fajr: '03:41',
      Sunrise: '05:49',
      Dhuhr: '13:33',
      Asr: '17:43',
      Maghrib: '21:17',
      Isha: '23:25',
    },
    date: {
      readable: '13 May 2026',
      hijri: {
        day: '26',
        month: { en: 'Dhū al-Qaʿdah' },
        year: '1447',
      },
    },
  };

  // TODO: Replace with actual weather data from backend (Open-Meteo)
  const weather = {
    code: 51,
    temperature: 22,
    high: 24,
    low: 16,
    windSpeed: 12,
  };

  return (
    <section className="bg-[#FAFAF8] px-4 pt-7 pb-10">
      <TripStats days={totalDays} activities={totalActivities} />

      <div className="mt-8 flex flex-col gap-4">
        <InsightCard
          icon={<Zap size={19} strokeWidth={1.9} />}
          title="Trip Energy"
          percent={tripEnergy}
          helperText={energyHelperText}
        />

        <InsightCard
          icon={<Wallet size={19} strokeWidth={1.9} />}
          title="Budget"
          percent={budgetPercent}
          helperText={`$${budgetUsed.toLocaleString()} spent`}
          trailingText={
            budgetTotal > 0
              ? `$${budgetTotal.toLocaleString()} total`
              : 'No budget set'
          }
          showChevron={budgetTotal === 0}
        />

        <WeatherCard weather={weather} />

        <PrayerTimesCard prayerTimes={prayerTimes} />
      </div>
    </section>
  );
}

function TripStats({ days, activities }) {
  return (
    <div className="grid grid-cols-2">
      <StatBlock label="Days" value={days} />
      <StatBlock label="Activities" value={activities} hasDivider />
    </div>
  );
}

function StatBlock({ label, value, hasDivider }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-7 ${
        hasDivider ? 'border-l border-stone-200' : ''
      }`}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-400">
        {label}
      </span>

      <span className="mt-3 font-serif text-[48px] leading-none text-stone-950">
        {value}
      </span>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  percent,
  helperText,
  trailingText,
  showChevron = false,
}) {
  return (
    <article className="rounded-[10px] border border-stone-200 bg-white px-5 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-stone-900">
            {icon}
          </div>

          <h3 className="text-[17px] font-medium text-stone-950">{title}</h3>
        </div>

        <span className="text-[17px] font-medium text-stone-950">
          {percent}%
        </span>
      </div>

      <div className="mt-6 h-[5px] overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-stone-900 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-[15px] leading-snug text-stone-400">{helperText}</p>

        {trailingText && (
          <div className="flex shrink-0 items-center gap-2 text-[15px] text-stone-400">
            <span>{trailingText}</span>
            {showChevron && <ChevronRight size={18} strokeWidth={1.8} />}
          </div>
        )}
      </div>
    </article>
  );
}
