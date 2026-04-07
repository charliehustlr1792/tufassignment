'use client'

import { memo } from 'react'
import DayCell from './DayCell'
import { areDatesEqual, isInRange } from '@/app/utils/dateUtils'
import { DateRange } from '@/app/types/calendar'

interface CalendarGridProps {
  days: Date[]
  currentMonth: Date
  selectedRange: DateRange
  onDateClick: (date: Date) => void
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void
}

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const CalendarGrid = memo(({
  days,
  currentMonth,
  selectedRange,
  onDateClick,
  onKeyDown,
}: CalendarGridProps) => {
  return (
    <div role="grid" className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2">
        {WEEKDAY_LABELS.map((day, index) => {
          const isWeekend = index >= 5
          return (
            <div
              key={day}
              className={`text-center text-[10px] sm:text-xs font-bold tracking-wide py-1.5 ${
                isWeekend ? 'text-cyan-500' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date) => {
          const isRangeStart = areDatesEqual(date, selectedRange.start)
          const isRangeEnd = areDatesEqual(date, selectedRange.end)
          const inRange = isInRange(date, selectedRange.start, selectedRange.end)
          const isSelected = isRangeStart || isRangeEnd || inRange
          
          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              currentMonth={currentMonth}
              isSelected={isSelected}
              isRangeStart={isRangeStart}
              isRangeEnd={isRangeEnd}
              isInRange={inRange && !isRangeStart && !isRangeEnd}
              onClick={onDateClick}
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
