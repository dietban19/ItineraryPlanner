import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
} from 'lucide-react';

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

export default function WeatherCard({ weather }) {
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
