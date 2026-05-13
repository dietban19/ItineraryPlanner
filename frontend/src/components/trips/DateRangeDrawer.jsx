import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

export function formatDateLabel(start, end) {
  if (!start) return '';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const s = new Date(start + 'T00:00:00');
  const sm = months[s.getMonth()];
  const sd = s.getDate();
  if (!end) return `${sm} ${sd}`;
  const e = new Date(end + 'T00:00:00');
  const em = months[e.getMonth()];
  const ed = e.getDate();
  return sm === em ? `${sm} ${sd} – ${ed}` : `${sm} ${sd} – ${em} ${ed}`;
}

export default function DateRangeDrawer({
  isOpen,
  onClose,
  initialStart = '',
  initialEnd = '',
  onSave,
}) {
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStart || '');
      setEndDate(initialEnd || '');
    }
  }, [isOpen, initialStart, initialEnd]);

  function handleSave() {
    if (!startDate) return;
    onSave({
      start: startDate,
      end: endDate || null,
      label: formatDateLabel(startDate, endDate),
    });
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 className="text-xl font-bold text-stone-800">Date Range</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 active:bg-stone-200 transition-colors"
          >
            <X size={17} className="text-stone-600" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-10">
          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                Start Date
              </label>
              <div className="bg-stone-100 rounded-2xl px-4 py-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) setEndDate('');
                  }}
                  className="w-full bg-transparent text-sm text-stone-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                End Date
              </label>
              <div className="bg-stone-100 rounded-2xl px-4 py-4">
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-stone-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {startDate && (
            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-stone-50 rounded-2xl mb-6">
              <Calendar size={15} className="text-stone-400 shrink-0" />
              <span className="text-sm text-stone-600">
                {formatDateLabel(startDate, endDate)}
              </span>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!startDate}
            className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all ${
              startDate
                ? 'bg-stone-800 text-white active:scale-[0.98]'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            Save Dates
          </button>
        </div>
      </div>
    </>
  );
}
