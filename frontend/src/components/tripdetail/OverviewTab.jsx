import {
  Zap,
  Wallet,
  ChevronRight,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';

// WMO weather interpretation codes (Open-Meteo)
const WEATHER_INFO = {
  0: {
    label: 'Clear Sky',
    Icon: Sun,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-50',
  },
  1: {
    label: 'Mainly Clear',
    Icon: Sun,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-50',
  },
  2: {
    label: 'Partly Cloudy',
    Icon: CloudSun,
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-50',
  },
  3: {
    label: 'Overcast',
    Icon: Cloud,
    iconColor: 'text-slate-400',
    bgColor: 'bg-slate-100',
  },
  45: {
    label: 'Foggy',
    Icon: Wind,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  48: {
    label: 'Rime Fog',
    Icon: Wind,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
  },
  51: {
    label: 'Light Drizzle',
    Icon: CloudDrizzle,
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-50',
  },
  53: {
    label: 'Moderate Drizzle',
    Icon: CloudDrizzle,
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  55: {
    label: 'Dense Drizzle',
    Icon: CloudDrizzle,
    iconColor: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
  56: {
    label: 'Light Freezing Drizzle',
    Icon: CloudDrizzle,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-50',
  },
  57: {
    label: 'Dense Freezing Drizzle',
    Icon: CloudDrizzle,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  61: {
    label: 'Slight Rain',
    Icon: CloudRain,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-50',
  },
  63: {
    label: 'Moderate Rain',
    Icon: CloudRain,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  65: {
    label: 'Heavy Rain',
    Icon: CloudRain,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  66: {
    label: 'Light Freezing Rain',
    Icon: CloudRain,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-50',
  },
  67: {
    label: 'Heavy Freezing Rain',
    Icon: CloudRain,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  71: {
    label: 'Slight Snowfall',
    Icon: CloudSnow,
    iconColor: 'text-sky-300',
    bgColor: 'bg-sky-50',
  },
  73: {
    label: 'Moderate Snowfall',
    Icon: CloudSnow,
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-50',
  },
  75: {
    label: 'Heavy Snowfall',
    Icon: CloudSnow,
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  77: {
    label: 'Snow Grains',
    Icon: CloudSnow,
    iconColor: 'text-sky-300',
    bgColor: 'bg-sky-50',
  },
  80: {
    label: 'Slight Rain Showers',
    Icon: CloudRain,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-50',
  },
  81: {
    label: 'Moderate Rain Showers',
    Icon: CloudRain,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  82: {
    label: 'Violent Rain Showers',
    Icon: CloudRain,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  85: {
    label: 'Slight Snow Showers',
    Icon: CloudSnow,
    iconColor: 'text-sky-300',
    bgColor: 'bg-sky-50',
  },
  86: {
    label: 'Heavy Snow Showers',
    Icon: CloudSnow,
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-50',
  },
  95: {
    label: 'Thunderstorm',
    Icon: CloudLightning,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  96: {
    label: 'Thunderstorm w/ Hail',
    Icon: CloudLightning,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  99: {
    label: 'Thunderstorm w/ Heavy Hail',
    Icon: CloudLightning,
    iconColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
};

function getWeatherInfo(code) {
  return (
    WEATHER_INFO[code] ?? {
      label: 'Unknown',
      Icon: Cloud,
      iconColor: 'text-stone-400',
      bgColor: 'bg-stone-100',
    }
  );
}

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
        <WeatherCard weather={weather} />

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

function WeatherCard({ weather }) {
  const { label, Icon, iconColor, bgColor } = getWeatherInfo(weather.code);

  return (
    <article className="rounded-[10px] border border-stone-200 bg-white px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left — icon, title, description, stats */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${bgColor} ${iconColor}`}
            >
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-[17px] font-medium text-stone-950">Weather</h3>
          </div>

          <p className="mt-3 text-[18px] text-stone-500">{label}</p>

          <div className="mt-3 flex items-center gap-1.5 text-[16px] text-stone-400">
            <span>H: {weather.high}°</span>
            <span className="text-stone-200">·</span>
            <span>L: {weather.low}°</span>
            <span className="text-stone-200">·</span>
            <Wind size={12} strokeWidth={2} className="text-stone-300" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>

        {/* Right — current temperature */}
        <span
          className={`shrink-0 font-serif text-[52px] leading-none ${iconColor}`}
        >
          {weather.temperature}°
        </span>
      </div>
    </article>
  );
}
