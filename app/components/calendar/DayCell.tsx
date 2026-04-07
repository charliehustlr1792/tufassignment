'use client'

import { memo } from 'react'
import { format } from 'date-fns'
import { isToday, isInCurrentMonth, isWeekend } from '@/app/utils/dateUtils'

interface DayCellProps {
  date: Date
  currentMonth: Date
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  onClick: (date: Date) => void
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void
}

const DayCell = memo(({
  date,
  currentMonth,
  isSelected,
  isRangeStart,
  isRangeEnd,
  isInRange,
  onClick,
  onKeyDown,
}: DayCellProps) => {
  const today = isToday(date)
  const inMonth = isInCurrentMonth(date, currentMonth)
  const weekend = isWeekend(date)
  const dayNumber = format(date, 'd')
  
  const getCellStyles = (): string => {
    const baseStyles = 'relative h-8 sm:h-9 flex items-center justify-center cursor-pointer transition-all duration-150 select-none font-medium text-xs sm:text-sm rounded-sm'
    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:z-10'
    
    let styles = `${baseStyles} ${focusStyles}`
    
    if (!inMonth) {
      styles += ' text-gray-300 hover:text-gray-400'
      return styles
    }
    
    if (isRangeStart || isRangeEnd) {
      styles += ' bg-cyan-500 text-white font-bold shadow-md hover:bg-cyan-600'
      return styles
    }
    
    if (isInRange) {
      styles += ' bg-cyan-50 text-cyan-900 font-semibold hover:bg-cyan-100'
      return styles
    }
    
    if (today) {
      styles += ' bg-black text-white font-bold hover:bg-gray-800'
      return styles
    }
    
    if (weekend) {
      styles += ' text-cyan-500 font-semibold hover:bg-cyan-50'
      return styles
    }
    
    styles += ' text-gray-800 hover:bg-gray-100'
    return styles
  }
  
  return (
    <button
      role="gridcell"
      aria-label={format(date, 'MMMM d, yyyy')}
      aria-selected={isSelected}
      tabIndex={inMonth ? 0 : -1}
      className={getCellStyles()}
      onClick={() => onClick(date)}
      onKeyDown={(e) => onKeyDown(e, date)}
    >
      {dayNumber}
      {today && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
      )}
    </button>
  )
})

DayCell.displayName = 'DayCell'

export default DayCell
