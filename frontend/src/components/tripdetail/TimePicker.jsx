import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import { Clock } from 'lucide-react';

const ITEM_H = 52;
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];
const PERIODS = ['AM', 'PM'];

function parseTimeValue(value) {
  if (!value) return { hourIdx: 8, minuteIdx: 0, periodIdx: 0 }; // default: 9:00 AM
  const parts = value.split(':');
  if (parts.length < 2) return { hourIdx: 8, minuteIdx: 0, periodIdx: 0 };
  const h24 = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h24) || isNaN(m)) return { hourIdx: 8, minuteIdx: 0, periodIdx: 0 };
  const snappedMinute = MINUTES.reduce((best, curr) =>
    Math.abs(curr - m) < Math.abs(best - m) ? curr : best,
  );
  const period = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 || 12;
  const hourIdx = HOURS.indexOf(h12);
  const minuteIdx = MINUTES.indexOf(snappedMinute);
  const periodIdx = PERIODS.indexOf(period);
  return {
    hourIdx: hourIdx >= 0 ? hourIdx : 8,
    minuteIdx: minuteIdx >= 0 ? minuteIdx : 0,
    periodIdx: periodIdx >= 0 ? periodIdx : 0,
  };
}

function buildTimeString(hourIdx, minuteIdx, periodIdx) {
  const h12 = HOURS[hourIdx] ?? 9;
  const m = MINUTES[minuteIdx] ?? 0;
  const period = PERIODS[periodIdx] ?? 'AM';
  let h24 = h12 % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function WheelColumn({
  items,
  selectedIndex,
  onSelect,
  formatItem,
  width = 76,
}) {
  const listRef = useRef(null);
  const scrollTimer = useRef(null);

  // Set scroll position instantly on mount
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = selectedIndex * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth scroll to newly selected index (from tap)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const current = Math.round(el.scrollTop / ITEM_H);
    if (current !== selectedIndex) {
      el.scrollTo({ top: selectedIndex * ITEM_H, behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = listRef.current;
      if (!el) return;
      const idx = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)),
      );
      if (idx !== selectedIndex) onSelect(idx);
    }, 80);
  }, [items.length, onSelect, selectedIndex]);

  return (
    <div
      style={{
        position: 'relative',
        height: ITEM_H * 3,
        width,
        // CSS mask fades top/bottom without z-index overlay interference
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        maskImage:
          'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
      }}
    >
      {/* Center highlight strip */}
      <div
        style={{
          position: 'absolute',
          top: ITEM_H,
          left: 4,
          right: 4,
          height: ITEM_H,
          borderRadius: 14,
          backgroundColor: '#f5f5f4',
          pointerEvents: 'none',
        }}
      />

      {/* Scrollable list — z-index 1 so it paints above the highlight */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="[&::-webkit-scrollbar]:hidden"
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingTop: ITEM_H,
          paddingBottom: ITEM_H,
          zIndex: 1,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => onSelect(i)}
            style={{
              height: ITEM_H,
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: i === selectedIndex ? '#1c1917' : '#c8c4bf',
                transition: 'color 0.1s',
              }}
            >
              {formatItem ? formatItem(item) : String(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimePicker({ value, onChange, onClose }) {
  const init = parseTimeValue(value);
  const [hIdx, setHIdx] = useState(init.hourIdx);
  const [mIdx, setMIdx] = useState(init.minuteIdx);
  const [pIdx, setPIdx] = useState(init.periodIdx);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function animateClose(callback) {
    setEntered(false);
    setTimeout(callback, 260);
  }

  function handleDone() {
    onChange(buildTimeString(hIdx, mIdx, pIdx));
    animateClose(onClose);
  }

  function handleClear() {
    onChange('');
    animateClose(onClose);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-40 bg-black/20 transition-opacity duration-260 ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => animateClose(onClose)}
      />

      {/* Bottom sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white shadow-[0_-16px_60px_rgba(0,0,0,0.15)] transition-transform duration-260 ease-out ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <button
            onClick={handleClear}
            className="py-1 text-[14px] text-stone-400 active:text-stone-700"
          >
            Clear
          </button>
          <div className="flex items-center gap-1.5">
            <Clock size={14} strokeWidth={1.9} className="text-stone-500" />
            <span className="text-[15px] font-semibold text-stone-800">
              Set time
            </span>
          </div>
          <button
            onClick={handleDone}
            className="py-1 text-[14px] font-semibold text-stone-900 active:text-stone-500"
          >
            Done
          </button>
        </div>

        {/* Drum wheels */}
        <div className="flex items-center justify-center py-4 pb-10 gap-0">
          <WheelColumn
            items={HOURS}
            selectedIndex={hIdx}
            onSelect={setHIdx}
            formatItem={(h) => String(h).padStart(2, '0')}
            width={76}
          />

          <span
            className="select-none font-bold text-stone-300"
            style={{ fontSize: 24, marginBottom: 2 }}
          >
            :
          </span>

          <WheelColumn
            items={MINUTES}
            selectedIndex={mIdx}
            onSelect={setMIdx}
            formatItem={(m) => String(m).padStart(2, '0')}
            width={76}
          />

          <div style={{ width: 20 }} />

          <WheelColumn
            items={PERIODS}
            selectedIndex={pIdx}
            onSelect={setPIdx}
            width={64}
          />
        </div>
      </div>
    </>
  );
}
