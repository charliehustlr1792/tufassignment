'use client'

import { memo } from 'react'
import DayCell from './DayCell'
import { areDatesEqual, isInRange } from '@/app/utils/dateUtils'
import { DateRange } from '@/app/types/calendar'
import { isBefore, isAfter, isSameDay } from 'date-fns'

interface CalendarGridProps {
  days: Date[]
  currentMonth: Date
  selectedRange: DateRange
  hoverDate: Date | null
  onDateClick: (date: Date) => void
  onDateHover: (date: Date | null) => void
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void
}

// SAT = index 5, SUN = index 6
const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const isInHoverRange = (date: Date, sel: DateRange, hover: Date | null): boolean => {
  if (!sel.start || sel.end || !hover) return false
  if (isSameDay(date, sel.start) || isSameDay(date, hover)) return false
  const lo = isBefore(sel.start, hover) ? sel.start : hover
  const hi = isBefore(sel.start, hover) ? hover : sel.start
  return isAfter(date, lo) && isBefore(date, hi)
}

const CalendarGrid = memo(({
  days,
  currentMonth,
  selectedRange,
  hoverDate,
  onDateClick,
  onDateHover,
  onKeyDown,
}: CalendarGridProps) => {
  return (
    <div role="grid" aria-label="Calendar" className="w-full">

      {/* Weekday header row */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label, idx) => {
          const isWeekend = idx >= 5
          return (
            <div
              key={label}
              className={`text-center font-bold tracking-wide py-1 ${
                // ── SAT/SUN → rose to match the day number colours in DayCell ──
                isWeekend ? 'text-cyan-500 font-extrabold' : 'text-gray-500'
                }`}
              style={{ fontSize: '10px' }}
            >
              {label}
            </div>
          )
        })}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const isRangeStart = areDatesEqual(date, selectedRange.start)
          const isRangeEnd = areDatesEqual(date, selectedRange.end)
          const inRange = isInRange(date, selectedRange.start, selectedRange.end)
          const inHoverRange = isInHoverRange(date, selectedRange, hoverDate)
          const isHoverEnd = !!selectedRange.start && !selectedRange.end
            && hoverDate != null && isSameDay(date, hoverDate)

          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              currentMonth={currentMonth}
              isSelected={isRangeStart || isRangeEnd || inRange}
              isRangeStart={isRangeStart}
              isRangeEnd={isRangeEnd || isHoverEnd}
              isInRange={inRange && !isRangeStart && !isRangeEnd}
              isHoverRange={inHoverRange}
              onClick={onDateClick}
              onHover={onDateHover}
              onKeyDown={onKeyDown}
            />
          )
        })}
      </div>
    </div>
  )
})

CalendarGrid.displayName = 'CalendarGrid'

export default CalendarGrid