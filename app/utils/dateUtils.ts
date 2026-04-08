import {
  startOfMonth,
  startOfWeek,
  addDays,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  isBefore,
  format,
  addMonths,
  subMonths,
} from 'date-fns'

export const generateCalendarDays = (currentMonth: Date): Date[] => {
  const monthStart = startOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = addDays(calendarStart, 41)

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
}

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date())
}

export const isInCurrentMonth = (date: Date, currentMonth: Date): boolean => {
  return isSameMonth(date, currentMonth)
}

export const isInRange = (
  date: Date,
  start: Date | null,
  end: Date | null
): boolean => {
  if (!start || !end) return false

  try {
    return isWithinInterval(date, { start, end })
  } catch {
    return false
  }
}

export const normalizeDateRange = (
  start: Date | null,
  end: Date | null
): { start: Date | null; end: Date | null } => {
  if (!start || !end) return { start, end }

  if (isBefore(end, start)) {
    return { start: end, end: start }
  }

  return { start, end }
}

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy').toUpperCase()
}

export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1)
}

export const getPreviousMonth = (date: Date): Date => {
  return subMonths(date, 1)
}

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

export const areDatesEqual = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false
  return isSameDay(date1, date2)
}
