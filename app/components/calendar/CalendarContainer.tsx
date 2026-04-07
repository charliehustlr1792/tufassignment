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
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: null,
    end: null,
  })
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next')
  const lastScrollTime = useRef<number>(0)
  const calendarRef = useRef<HTMLDivElement>(null)
  
  // Preload audio on mount
  useEffect(() => {
    preloadPageTurnSound()
  }, [])
  
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentMonth)
  }, [currentMonth])
  
  const changeMonth = useCallback((direction: 'next' | 'prev') => {
    if (isFlipping) return
    
    setFlipDirection(direction)
    setIsFlipping(true)
    playPageTurnSound()
    
    setTimeout(() => {
      setCurrentMonth(prev => direction === 'next' ? getNextMonth(prev) : getPreviousMonth(prev))
      setTimeout(() => setIsFlipping(false), 100)
    }, 300)
  }, [isFlipping])
  
  const handleDateClick = useCallback((date: Date) => {
    // If clicking a date from different month, navigate to that month
    if (!isSameMonth(date, currentMonth)) {
      const isNextMonth = date > currentMonth
      changeMonth(isNextMonth ? 'next' : 'prev')
    }
    
    setSelectedRange(prev => {
      if (!prev.start) {
        return { start: date, end: null }
      }
      
      if (!prev.end) {
        if (isSameDay(date, prev.start)) {
          return { start: date, end: date }
        }
        
        const normalized = normalizeDateRange(prev.start, date)
        return normalized
      }
      
      return { start: date, end: null }
    })
  }, [currentMonth, changeMonth])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentDate: Date) => {
    const key = e.key
    
    if (key === 'Enter' || key === ' ') {
      e.preventDefault()
      handleDateClick(currentDate)
      return
    }
    
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      return
    }
    
    e.preventDefault()
    
    let newDate = currentDate
    
    switch (key) {
      case 'ArrowLeft':
        newDate = subDays(currentDate, 1)
        break
      case 'ArrowRight':
        newDate = addDays(currentDate, 1)
        break
      case 'ArrowUp':
        newDate = subDays(currentDate, 7)
        break
      case 'ArrowDown':
        newDate = addDays(currentDate, 7)
        break
    }
    
    const button = document.querySelector(
      `button[aria-label*="${newDate.toLocaleDateString()}"]`
    ) as HTMLButtonElement
    
    button?.focus()
  }, [handleDateClick])
  
  // Wheel scroll to change month - attached to the calendar container
  useEffect(() => {
    const calendarEl = calendarRef.current
    if (!calendarEl) return
    
    const handleWheel = (e: WheelEvent) => {
      // Prevent default to stop page scrolling
      e.preventDefault()
      
      const now = Date.now()
      // Debounce: only allow one scroll per 700ms
      if (now - lastScrollTime.current < 700) return
      
      // Require significant scroll movement
      if (Math.abs(e.deltaY) > 20) {
        lastScrollTime.current = now
        if (e.deltaY > 0) {
          changeMonth('next')
        } else {
          changeMonth('prev')
        }
      }
    }
    
    // Use passive: false to allow preventDefault
    calendarEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => calendarEl.removeEventListener('wheel', handleWheel)
  }, [changeMonth])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Wall Calendar Container - Compact size */}
      <div 
        ref={calendarRef}
        className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden relative select-none"
        style={{ perspective: '1500px' }}
      >
        {/* Hero Image with flip animation */}
        <div 
          className={`relative origin-top ${
            isFlipping 
              ? flipDirection === 'next' 
                ? 'animate-flip-next' 
                : 'animate-flip-prev'
              : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          <HeroImage currentMonth={currentMonth} />
        </div>
        
        {/* Calendar Body - Notes LEFT, Grid RIGHT */}
        <div className="p-4 sm:p-5">
          <div className="flex gap-4">
            {/* LEFT: Notes Section (Editable Lines) - Fixed width */}
            <div className="hidden lg:block w-28 flex-shrink-0">
              <NotesPanel selectedRange={selectedRange} currentMonth={currentMonth} staticLines />
            </div>
            
            {/* RIGHT: Calendar Grid - Takes remaining space */}
            <div className="flex-1 min-w-0">
              <CalendarGrid
                days={calendarDays}
                currentMonth={currentMonth}
                selectedRange={selectedRange}
                onDateClick={handleDateClick}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
        
        {/* Scroll hint */}
        <div className="text-center pb-3 text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Scroll to flip pages
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Mobile Interactive Notes - Bottom Drawer */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 max-h-[50vh] bg-white border-t-2 border-gray-200 shadow-2xl rounded-t-2xl overflow-hidden z-50">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
        <div className="overflow-y-auto p-4">
          <NotesPanel selectedRange={selectedRange} currentMonth={currentMonth} compact />
        </div>
      </div>
    </div>
  )
}

export default CalendarContainer
