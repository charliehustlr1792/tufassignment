'use client'

import { memo } from 'react'
import { format } from 'date-fns'
import { isToday, isInCurrentMonth, isWeekend } from '@/app/utils/dateUtils'

// ── Indian public holidays (add more as needed) ───────────────────────────
// Key format: "YYYY-M-D"  (month is NOT zero-padded)
const HOLIDAYS: Record<string, string> = {
  '2025-1-26': 'Republic Day',
  '2025-3-17': 'Holi',
  '2025-3-30': 'Ram Navami',
  '2025-4-14': 'Dr. Ambedkar Jayanti',
  '2025-4-18': 'Good Friday',
  '2025-8-15': 'Independence Day',
  '2025-8-27': 'Janmashtami',
  '2025-10-2': 'Gandhi Jayanti',
  '2025-10-20': 'Dussehra',
  '2025-11-5': 'Diwali',
  '2025-12-25': 'Christmas',
  '2026-1-26': 'Republic Day',
  '2026-3-6': 'Holi',
  '2026-8-15': 'Independence Day',
  '2026-10-2': 'Gandhi Jayanti',
  '2026-12-25': 'Christmas',
}

const holidayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

// ── props ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  date: Date
  currentMonth: Date
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  isHoverRange: boolean
  onClick: (date: Date) => void
  onHover: (date: Date | null) => void
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void
}

// ── component ─────────────────────────────────────────────────────────────

const DayCell = memo(({
  date,
  currentMonth,
  isSelected,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isHoverRange,
  onClick,
  onHover,
  onKeyDown,
}: DayCellProps) => {
  const today = isToday(date)
  const inMonth = isInCurrentMonth(date, currentMonth)
  const weekend = isWeekend(date)
  const dayNum = format(date, 'd')
  const holiday = HOLIDAYS[holidayKey(date)]

  // ── style logic ───────────────────────────────────────────────────────────
  // min-h-[44px] ensures Apple's minimum tap target on mobile
  const base = 'relative w-full min-h-[40px] sm:min-h-[38px] flex items-center justify-center cursor-pointer transition-colors duration-100 select-none font-medium rounded-[3px]'
  const focusR = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:z-10'

  let cls = `${base} ${focusR} text-[12px] sm:text-[13px]`

  if (!inMonth) {
    cls += ' text-gray-300 cursor-default pointer-events-none'
  } else if (isRangeStart || isRangeEnd) {
    // Solid cyan endpoint — same whether or not it's today
    cls += ' bg-cyan-500 text-white font-bold shadow-sm hover:bg-cyan-600'
  } else if (isInRange) {
    cls += today
      ? ' bg-cyan-100 text-cyan-800 font-bold ring-1 ring-inset ring-cyan-400'
      : ' bg-cyan-50 text-cyan-900 font-semibold hover:bg-cyan-100'
  } else if (isHoverRange) {
    cls += ' bg-cyan-50/60 text-cyan-700'
  } else if (today) {
    // Today outside any selection — dark pill
    cls += ' bg-gray-900 text-white font-bold hover:bg-gray-700'
  } else if (weekend) {
    // !! Rose/red — completely distinct from cyan selection color
    cls += ' text-cyan-500 font-semibold hover:bg-cyan-50'
  } else {
    cls += ' text-gray-800 hover:bg-gray-100'
  }

  return (
    <button
      role="gridcell"
      aria-label={format(date, 'MMMM d, yyyy')}
      aria-selected={isSelected}
      tabIndex={inMonth ? 0 : -1}
      className={cls}
      onClick={() => inMonth && onClick(date)}
      onMouseEnter={() => inMonth && onHover(date)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => inMonth && onHover(date)}
      onBlur={() => onHover(null)}
      onKeyDown={e => onKeyDown(e, date)}
    >
      {dayNum}

      {/* Today indicator dot (only when NOT a range endpoint) */}
      {today && !isRangeStart && !isRangeEnd && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-cyan-400 rounded-full" />
      )}

      {/* Holiday dot — amber, bottom-right corner */}
      {holiday && inMonth && (
        <span
          className="absolute bottom-0.5 right-0.5 w-[3px] h-[3px] bg-amber-400 rounded-full"
          title={holiday}
          aria-hidden="true"
        />
      )}
    </button>
  )
})

DayCell.displayName = 'DayCell'

export default DayCell