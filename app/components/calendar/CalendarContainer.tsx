'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { isSameDay, addDays, subDays, isSameMonth } from 'date-fns'
import CalendarGrid from './CalendarGrid'
import HeroImage, { MONTH_IMAGES } from './HeroImage'
import NotesPanel from './NotesPanel'
import { DateRange } from '@/app/types/calendar'
import {
  generateCalendarDays,
  getNextMonth,
  getPreviousMonth,
  normalizeDateRange,
} from '@/app/utils/dateUtils'
import { playPageTurnSound, preloadPageTurnSound } from '@/app/utils/soundEffects'

interface CalendarSheetProps {
  month: Date
  days: Date[]
  selectedRange: DateRange
  hoverDate: Date | null
  onDateClick: (date: Date) => void
  onDateHover: (date: Date | null) => void
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void
}

const CalendarSheet = ({
  month,
  days,
  selectedRange,
  hoverDate,
  onDateClick,
  onDateHover,
  onKeyDown,
}: CalendarSheetProps) => {
  return (
    <div className="w-full bg-white shadow-[0_8px_32px_rgba(15,23,42,0.18)]">
      <HeroImage currentMonth={month} />

      <div className="px-3 sm:px-5 pt-3 pb-4 sm:pb-5">
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className="pt-0.5 min-w-40 max-w-40">
            <NotesPanel
              selectedRange={selectedRange}
              currentMonth={month}
            />
          </div>

          <div className="flex-1 min-w-0">
            <CalendarGrid
              days={days}
              currentMonth={month}
              selectedRange={selectedRange}
              hoverDate={hoverDate}
              onDateClick={onDateClick}
              onDateHover={onDateHover}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const CalendarContainer = () => {
  const [displayMonth, setDisplayMonth] = useState(new Date())
  const [incomingMonth, setIncomingMonth] = useState<Date | null>(null)
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null })
  const [flipState, setFlipState] = useState<'idle' | 'flipping-next' | 'flipping-prev'>('idle')
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const lastScrollTime = useRef<number>(0)
  const calendarRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const touchEndY = useRef<number>(0)

  useEffect(() => {
    preloadPageTurnSound()
    Object.values(MONTH_IMAGES).forEach(imageMeta => {
      const img = new window.Image()
      img.src = imageMeta.url
    })
  }, [])

  const calendarDays = useMemo(() => generateCalendarDays(displayMonth), [displayMonth])
  const incomingDays = useMemo(
    () => (incomingMonth ? generateCalendarDays(incomingMonth) : []),
    [incomingMonth]
  )

  const changeMonth = useCallback((direction: 'next' | 'prev') => {
    if (flipState !== 'idle') return
    const nextMonth = direction === 'next'
      ? getNextMonth(displayMonth)
      : getPreviousMonth(displayMonth)
    setIncomingMonth(nextMonth)
    setFlipState(direction === 'next' ? 'flipping-next' : 'flipping-prev')
    playPageTurnSound()
    setTimeout(() => {
      setDisplayMonth(nextMonth)
      setIncomingMonth(null)
      setFlipState('idle')
    }, 700)
  }, [flipState, displayMonth])

  const handleDateClick = useCallback((date: Date) => {
    if (!isSameMonth(date, displayMonth)) {
      changeMonth(date > displayMonth ? 'next' : 'prev')
    }
    setSelectedRange(prev => {
      if (!prev.start) return { start: date, end: null }
      if (!prev.end) {
        if (isSameDay(date, prev.start)) return { start: date, end: date }
        return normalizeDateRange(prev.start, date)
      }
      return { start: date, end: null }
    })
    setHoverDate(null)
  }, [displayMonth, changeMonth])

  const handleDateHover = useCallback((date: Date | null) => {
    setHoverDate(date)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentDate: Date) => {
    const key = e.key
    if (key === 'Enter' || key === ' ') { e.preventDefault(); handleDateClick(currentDate); return }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return
    e.preventDefault()
    let newDate = currentDate
    switch (key) {
      case 'ArrowLeft': newDate = subDays(currentDate, 1); break
      case 'ArrowRight': newDate = addDays(currentDate, 1); break
      case 'ArrowUp': newDate = subDays(currentDate, 7); break
      case 'ArrowDown': newDate = addDays(currentDate, 7); break
    }
    const btn = document.querySelector(
      `button[aria-label="${newDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"]`
    ) as HTMLButtonElement
    btn?.focus()
  }, [handleDateClick])

  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastScrollTime.current < 850) return
      if (Math.abs(e.deltaY) < 25) return
      lastScrollTime.current = now
      changeMonth(e.deltaY > 0 ? 'next' : 'prev')
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [changeMonth])

  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    let startedOnInteractive = false

    const isInteractiveTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false
      return !!target.closest('button, input, textarea, select, a, [role="gridcell"], [contenteditable="true"]')
    }

    const handleTouchStart = (e: TouchEvent) => {
      startedOnInteractive = isInteractiveTarget(e.target)
      const touch = e.touches[0]
      touchStartX.current = touch.clientX
      touchStartY.current = e.touches[0].clientY
      touchEndX.current = touch.clientX
      touchEndY.current = touch.clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchEndX.current = touch.clientX
      touchEndY.current = touch.clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (startedOnInteractive) {
        startedOnInteractive = false
        return
      }
      const fallbackTouch = e.changedTouches[0]
      const endX = touchEndX.current || fallbackTouch.clientX
      const endY = touchEndY.current || fallbackTouch.clientY
      const deltaY = touchStartY.current - endY
      const deltaX = touchStartX.current - endX
      const now = Date.now()
      if (Math.abs(deltaY) < 50) return
      if (Math.abs(deltaY) <= Math.abs(deltaX)) return
      if (now - lastScrollTime.current < 800) return
      lastScrollTime.current = now
      changeMonth(deltaY > 0 ? 'next' : 'prev')
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [changeMonth])

  const currentSheetClass = flipState === 'flipping-next'
    ? 'animate-sheet-out-next'
    : flipState === 'flipping-prev'
      ? 'animate-sheet-out-prev'
      : ''

  const incomingSheetClass = flipState === 'flipping-next'
    ? 'animate-sheet-in-next'
    : flipState === 'flipping-prev'
      ? 'animate-sheet-in-prev'
      : ''

  return (
    <div className="h-screen bg-linear-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center px-3 py-4 sm:px-6 sm:py-6 overflow-hidden">
      <div
        ref={calendarRef}
        className="w-full max-w-120 select-none"
      >
        <div className="relative w-full perspective-[1800px]">
          <div
            className="absolute left-0.75 right-0.75 -bottom-1.5 h-3 z-0 bg-white shadow-sm"
            aria-hidden="true"
          />
          <div
            className="absolute left-1.5 right-1.5 -bottom-2.5 h-3 z-[-1] bg-gray-50 shadow-sm"
            aria-hidden="true"
          />
          <div
            className="absolute left-2.25 right-2.25 -bottom-3.25 h-3 z-[-2] bg-gray-100"
            aria-hidden="true"
          />

          <div
            className={`w-full relative z-10 origin-top transform-3d will-change-[transform,opacity] ${currentSheetClass}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <CalendarSheet
              month={displayMonth}
              days={calendarDays}
              selectedRange={selectedRange}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={handleDateHover}
              onKeyDown={handleKeyDown}
            />
          </div>

          {incomingMonth && (
            <div
              className={`absolute inset-0 w-full z-20 origin-top transform-3d will-change-[transform,opacity] ${incomingSheetClass}`}
              aria-hidden="true"
            >
              <CalendarSheet
                month={incomingMonth}
                days={incomingDays}
                selectedRange={selectedRange}
                hoverDate={hoverDate}
                onDateClick={handleDateClick}
                onDateHover={handleDateHover}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>

        <div className="text-center pt-4 pb-1 text-[8px] text-gray-400 flex items-center justify-center gap-1.5 tracking-[0.15em] uppercase">
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Scroll or swipe to flip
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default CalendarContainer
