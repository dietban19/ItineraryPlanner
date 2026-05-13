import { Moon } from 'lucide-react';

const PRAYER_DISPLAY = [
  { key: 'Fajr', label: 'Fajr' },
  { key: 'Sunrise', label: 'Sunrise' },
  { key: 'Dhuhr', label: 'Dhuhr' },
  { key: 'Asr', label: 'Asr' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'Isha' },
];

export default function PrayerTimesCard({ prayerTimes }) {
  const { timings, date } = prayerTimes;
  const hijriLabel = `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} AH`;

  return (
    <article className="rounded-[10px] border border-stone-200 bg-white px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-500">
            <Moon size={20} strokeWidth={1.8} />
          </div>
          <h3 className="text-[17px] font-medium text-stone-950">
            Prayer Times
          </h3>
        </div>
        <span className="shrink-0 text-[12px] text-stone-400">
          {hijriLabel}
        </span>
      </div>

      {/* Prayer grid */}
      <div className="mt-5 grid grid-cols-3 gap-y-4">
        {PRAYER_DISPLAY.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-stone-400">
              {label}
            </span>
            <span className="font-serif text-[17px] text-stone-800">
              {timings[key]}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
