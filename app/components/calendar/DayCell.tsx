'use client'

import { memo } from 'react'
import { format } from 'date-fns'
import { isToday, isInCurrentMonth, isWeekend } from '@/app/utils/dateUtils'

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
  const hasHoliday = !!holiday && inMonth

  const base = 'relative w-full min-h-[30px] sm:min-h-[36px] flex items-center justify-center cursor-pointer transition-colors duration-100 select-none font-medium rounded-[2px]'
  const focusR = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-1 focus-visible:z-10'

  let cls = `${base} ${focusR} text-[10px] sm:text-[13px]`

  if (!inMonth) {
    cls += ' text-gray-300 cursor-default pointer-events-none'
  } else if (isRangeStart || isRangeEnd) {
    cls += ' bg-[#0891b2] text-white font-bold shadow-sm hover:bg-[#0e7490]'
  } else if (isInRange) {
    cls += today
      ? ' bg-cyan-100 text-cyan-900 font-bold ring-1 ring-inset ring-cyan-500'
      : ' bg-cyan-50 text-cyan-900 font-semibold hover:bg-cyan-100'
  } else if (isHoverRange) {
    cls += ' bg-cyan-50/60 text-cyan-700'
  } else if (today) {
    cls += ' bg-gray-900 text-white font-bold hover:bg-gray-700'
  } else if (hasHoliday) {
    cls += ' text-red-600 font-bold hover:bg-red-50'
  } else if (weekend) {
    cls += ' text-[#0891b2] font-semibold hover:bg-cyan-50'
  } else {
    cls += ' text-gray-800 hover:bg-gray-100'
  }

  return (
    <button
      role="gridcell"
      aria-label={format(date, 'MMMM d, yyyy')}
      aria-selected={isSelected}
      tabIndex={inMonth ? 0 : -1}
      className={`${cls} group`}
      onClick={() => inMonth && onClick(date)}
      onMouseEnter={() => inMonth && onHover(date)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => inMonth && onHover(date)}
      onBlur={() => onHover(null)}
      onKeyDown={e => onKeyDown(e, date)}
    >
      {dayNum}

      {hasHoliday && !isRangeStart && !isRangeEnd && (
        <span
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100 z-20"
          aria-hidden="true"
        >
          {holiday}
        </span>
      )}

      {today && !isRangeStart && !isRangeEnd && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.75 h-0.75 bg-cyan-500 rounded-full" />
      )}

      {hasHoliday && (
        <span
          className="absolute bottom-0.5 right-0.5 w-0.75 h-0.75 bg-red-500 rounded-full"
          title={holiday}
          aria-hidden="true"
        />
      )}
    </button>
  )
})

DayCell.displayName = 'DayCell'

export default DayCell
