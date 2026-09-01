import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { formatDateOnly, toISODateStart, toISODateEnd } from '../../utils/formatDate';

interface DateRangePickerProps {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = startOfMonth(year, month);
  const firstWeekday = first.getDay(); // 0 = Sunday
  const total = daysInMonth(year, month);
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));

  return cells;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DateRangePicker({ from, to, onApply }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(from.slice(0, 10));
  const [rangeEnd, setRangeEnd] = useState<string | null>(to.slice(0, 10));
  const [pickingStart, setPickingStart] = useState<string | null>(null); // tracks in-progress selection
  const [leftMonth, setLeftMonth] = useState(() => {
    const d = new Date(from);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rightMonth =
    leftMonth.month === 11
      ? { year: leftMonth.year + 1, month: 0 }
      : { year: leftMonth.year, month: leftMonth.month + 1 };

  function goToPrevMonth() {
    setLeftMonth((prev) =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }
    );
  }

  function goToNextMonth() {
    setLeftMonth((prev) =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }
    );
  }

  function handleDayClick(date: Date) {
    const iso = toDateOnly(date);

    if (!pickingStart) {
      // Starting a fresh selection
      setPickingStart(iso);
      setRangeStart(iso);
      setRangeEnd(null);
      return;
    }

    // Completing the range
    if (iso < pickingStart) {
      setRangeStart(iso);
      setRangeEnd(pickingStart);
    } else {
      setRangeStart(pickingStart);
      setRangeEnd(iso);
    }
    setPickingStart(null);
  }

  function isInRange(date: Date): boolean {
    if (!rangeStart) return false;
    const iso = toDateOnly(date);
    const end = rangeEnd ?? rangeStart;
    return iso >= rangeStart && iso <= end;
  }

  function isRangeEdge(date: Date): boolean {
    const iso = toDateOnly(date);
    return iso === rangeStart || iso === (rangeEnd ?? rangeStart);
  }

  function handleApply() {
    if (!rangeStart) return;
    onApply(toISODateStart(new Date(rangeStart)), toISODateEnd(new Date(rangeEnd ?? rangeStart)));
    setIsOpen(false);
  }

  function renderMonth(year: number, month: number, showPrevArrow: boolean, showNextArrow: boolean) {
    const cells = buildMonthGrid(year, month);
    return (
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between px-1">
          {showPrevArrow ? (
            <button
              type="button"
              onClick={goToPrevMonth}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          ) : (
            <span className="w-6" />
          )}
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {MONTH_LABELS[month]} {year}
          </span>
          {showNextArrow ? (
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <span className="w-6" />
          )}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w} className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              {w}
            </span>
          ))}

          {cells.map((date, idx) => {
            if (!date) return <span key={idx} />;
            const inRange = isInRange(date);
            const isEdge = isRangeEdge(date);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(date)}
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                  isEdge
                    ? 'bg-primary-600 font-semibold text-white'
                    : inRange
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800 dark:hover:bg-gray-800"
      >
        <Calendar className="h-3.5 w-3.5 text-gray-400" />
        {formatDateOnly(from)} - {formatDateOnly(to)}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[560px] max-w-[95vw] rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex gap-6">
            {renderMonth(leftMonth.year, leftMonth.month, true, false)}
            {renderMonth(rightMonth.year, rightMonth.month, false, true)}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {rangeStart ? formatDateOnly(rangeStart) : '—'} - {rangeEnd ? formatDateOnly(rangeEnd) : '—'}
            </span>
            <button
              type="button"
              onClick={handleApply}
              disabled={!rangeStart}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}