'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { isSameDay, addDays, subDays, isSameMonth } from 'date-fns'
import CalendarGrid from './CalendarGrid'
import HeroImage from './HeroImage'
import NotesPanel from './NotesPanel'
import { DateRange } from '@/app/types/calendar'
import {
  generateCalendarDays,
  getNextMonth,
  getPreviousMonth,
  normalizeDateRange,
} from '@/app/utils/dateUtils'
import { playPageTurnSound, preloadPageTurnSound } from '@/app/utils/soundEffects'

const CalendarContainer = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [displayMonth, setDisplayMonth] = useState(new Date())
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null })
  const [flipState, setFlipState] = useState<'idle' | 'flipping-next' | 'flipping-prev'>('idle')
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const lastScrollTime = useRef<number>(0)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => { preloadPageTurnSound() }, [])

  const calendarDays = useMemo(() => generateCalendarDays(displayMonth), [displayMonth])

  const changeMonth = useCallback((direction: 'next' | 'prev') => {
    if (flipState !== 'idle') return
    const nextMonth = direction === 'next'
      ? getNextMonth(currentMonth)
      : getPreviousMonth(currentMonth)
    setCurrentMonth(nextMonth)
    setFlipState(direction === 'next' ? 'flipping-next' : 'flipping-prev')
    playPageTurnSound()
    setTimeout(() => { setDisplayMonth(nextMonth) }, 340)
    setTimeout(() => { setFlipState('idle') }, 750)
  }, [flipState, currentMonth])

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
      if (now - lastScrollTime.current < 900) return
      if (Math.abs(e.deltaY) < 30) return
      lastScrollTime.current = now
      changeMonth(e.deltaY > 0 ? 'next' : 'prev')
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [changeMonth])

  const flipClass = flipState === 'flipping-next'
    ? 'animate-flip-next'
    : flipState === 'flipping-prev'
      ? 'animate-flip-prev'
      : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center p-4 sm:p-6 md:p-8">

      {/*
        ─── OUTER CARD ───────────────────────────────────────────────
        rounded-2xl  → visible rounded corners (larger than rounded-lg)
        overflow-hidden → clips the hero image photo AND the chevron
                          shapes to those same rounded corners so the
                          card never looks square at the top
        ─────────────────────────────────────────────────────────────
      */}
      <div
        ref={calendarRef}
        className="bg-white rounded-2xl shadow-2xl w-full select-none overflow-hidden"
        style={{ maxWidth: '540px', perspective: '1500px' }}
      >
        {/* Flipping wrapper — hero + body flip as one unit */}
        <div
          className={`w-full ${flipClass}`}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center top',
            willChange: 'transform',
          }}
          aria-live="polite"
          aria-atomic="true"
        >

          {/* ── Hero image ── */}
          <HeroImage currentMonth={displayMonth} />

          {/* ── Calendar body: Notes LEFT | Grid RIGHT ── */}
          <div className="px-4 pt-3 pb-4">
            <div className="flex gap-3 items-start">

              {/* Notes panel — inline ruled paper */}
              <div className="w-[86px] flex-shrink-0 pt-0.5">
                <NotesPanel
                  selectedRange={selectedRange}
                  currentMonth={displayMonth}
                />
              </div>

              {/* Calendar grid */}
              <div className="flex-1 min-w-0">
                <CalendarGrid
                  days={calendarDays}
                  currentMonth={displayMonth}
                  selectedRange={selectedRange}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={handleDateHover}
                  onKeyDown={handleKeyDown}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Scroll hint — outside flip wrapper so it never flips */}
        <div className="text-center pb-2 text-[9px] text-gray-400 flex items-center justify-center gap-1.5 tracking-widest uppercase">
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Scroll to flip
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default CalendarContainer