'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { format, isSameMonth, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { Note, DateRange } from '@/app/types/calendar'
import { saveNotes, loadNotes } from '@/app/utils/localStorage'

interface NotesPanelProps {
  selectedRange: DateRange
  currentMonth: Date
  compact?: boolean
  staticLines?: boolean
}

// Note tied to a line position (can be general or date-specific)
interface LineNote {
  lineIndex: number
  content: string
  range?: DateRange | null // Optional - if set, note is tied to this date range
  month?: string // Store month key for month-specific general notes
}

const LINE_COUNT = 8

// Helper to check if a note's range overlaps with current month
const isNoteVisibleForMonth = (noteRange: DateRange | null | undefined, currentMonth: Date): boolean => {
  if (!noteRange || !noteRange.start || !noteRange.end) return false
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  
  // Check if note range overlaps with current month
  const noteStart = new Date(noteRange.start)
  const noteEnd = new Date(noteRange.end)
  
  return (
    isWithinInterval(noteStart, { start: monthStart, end: monthEnd }) ||
    isWithinInterval(noteEnd, { start: monthStart, end: monthEnd }) ||
    (noteStart <= monthStart && noteEnd >= monthEnd)
  )
}

// Helper to check if note's range overlaps with selected range
const rangesOverlap = (range1: DateRange | null | undefined, range2: DateRange): boolean => {
  if (!range1 || !range1.start || !range1.end) return false
  if (!range2.start || !range2.end) return false
  
  const start1 = new Date(range1.start)
  const end1 = new Date(range1.end)
  const start2 = new Date(range2.start)
  const end2 = new Date(range2.end)
  
  return start1 <= end2 && end1 >= start2
}

const NotesPanel = memo(({ selectedRange, currentMonth, compact = false, staticLines = false }: NotesPanelProps) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [noteInput, setNoteInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // For editable lines
  const [allLineNotes, setAllLineNotes] = useState<LineNote[]>([])
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [lineInput, setLineInput] = useState('')
  
  // Current month key for storing notes
  const monthKey = format(currentMonth, 'yyyy-MM')
  
  // Load notes from localStorage
  useEffect(() => {
    setNotes(loadNotes())
    
    // Load line notes from localStorage
    if (typeof window !== 'undefined') {
      const savedLineNotes = localStorage.getItem('calendar_line_notes_v2')
      if (savedLineNotes) {
        try {
          const parsed = JSON.parse(savedLineNotes)
          // Convert date strings back to Date objects
          const restored = parsed.map((ln: LineNote) => ({
            ...ln,
            range: ln.range ? {
              start: ln.range.start ? new Date(ln.range.start) : null,
              end: ln.range.end ? new Date(ln.range.end) : null,
            } : null
          }))
          setAllLineNotes(restored)
        } catch {
          setAllLineNotes([])
        }
      }
    }
  }, [])
  
  // Save notes to localStorage
  useEffect(() => {
    saveNotes(notes)
  }, [notes])
  
  // Save line notes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && allLineNotes.length > 0) {
      localStorage.setItem('calendar_line_notes_v2', JSON.stringify(allLineNotes))
    }
  }, [allLineNotes])
  
  const hasValidRange = selectedRange.start && selectedRange.end
  
  const formatRange = (range: DateRange): string => {
    if (!range.start || !range.end) return ''
    const start = new Date(range.start)
    const end = new Date(range.end)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }
  
  // Filter line notes to show only relevant ones for current context
  const visibleLineNotes = useMemo(() => {
    return allLineNotes.filter(ln => {
      // If note has a date range, check if it's relevant
      if (ln.range && ln.range.start && ln.range.end) {
        // Show if range overlaps with current month
        if (isNoteVisibleForMonth(ln.range, currentMonth)) return true
        // Show if range overlaps with current selection
        if (hasValidRange && rangesOverlap(ln.range, selectedRange)) return true
        return false
      }
      
      // If note has a month key (general memo for specific month)
      if (ln.month) {
        return ln.month === monthKey
      }
      
      // Legacy notes without month key - show everywhere (backwards compatibility)
      return true
    })
  }, [allLineNotes, currentMonth, selectedRange, hasValidRange, monthKey])
  
  // Get visible content for a line index
  const getVisibleLineContent = useCallback((index: number): string => {
    const lineNote = visibleLineNotes.find(ln => ln.lineIndex === index)
    return lineNote?.content || ''
  }, [visibleLineNotes])
  
  const getVisibleLineRange = useCallback((index: number): DateRange | null => {
    const lineNote = visibleLineNotes.find(ln => ln.lineIndex === index)
    return lineNote?.range || null
  }, [visibleLineNotes])
  
  // Check if a line has content (visible or not)
  const hasAnyContent = useCallback((index: number): boolean => {
    return allLineNotes.some(ln => ln.lineIndex === index)
  }, [allLineNotes])

  const handleAddNote = () => {
    if (!noteInput.trim() || !hasValidRange) return
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: noteInput.trim(),
      range: { ...selectedRange },
      createdAt: Date.now(),
    }
    
    setNotes(prev => [...prev, newNote])
    setNoteInput('')
  }
  
  const handleEditNote = (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      setNoteInput(note.content)
      setEditingId(id)
    }
  }
  
  const handleUpdateNote = () => {
    if (!noteInput.trim() || !editingId) return
    
    setNotes(prev => prev.map(note =>
      note.id === editingId
        ? { ...note, content: noteInput.trim() }
        : note
    ))
    
    setNoteInput('')
    setEditingId(null)
  }
  
  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }
  
  const handleCancel = () => {
    setNoteInput('')
    setEditingId(null)
  }
  
  const handleLineClick = useCallback((index: number) => {
    setEditingLine(index)
    setLineInput(getVisibleLineContent(index))
  }, [getVisibleLineContent])
  
  const handleLineSave = useCallback((index: number) => {
    const trimmed = lineInput.trim()
    
    setAllLineNotes(prev => {
      // Find existing note for this line in current context
      const existingIndex = prev.findIndex(ln => {
        if (ln.lineIndex !== index) return false
        
        // Match by range if we have one selected
        if (hasValidRange && ln.range) {
          return rangesOverlap(ln.range, selectedRange)
        }
        
        // Match by month for general memos
        if (ln.month === monthKey) return true
        
        // Match notes visible in current month
        if (ln.range && isNoteVisibleForMonth(ln.range, currentMonth)) return true
        
        return false
      })
      
      if (!trimmed) {
        // Remove if empty
        if (existingIndex >= 0) {
          return prev.filter((_, i) => i !== existingIndex)
        }
        return prev
      }
      
      // Create new note with proper context
      const newNote: LineNote = {
        lineIndex: index,
        content: trimmed,
        range: hasValidRange ? { ...selectedRange } : null,
        month: hasValidRange ? undefined : monthKey, // Store month only for general memos
      }
      
      if (existingIndex >= 0) {
        // Update existing
        return prev.map((ln, i) => i === existingIndex ? newNote : ln)
      }
      
      // Add new
      return [...prev, newNote]
    })
    
    setEditingLine(null)
    setLineInput('')
  }, [lineInput, hasValidRange, selectedRange, monthKey, currentMonth])
  
  const handleLineKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLineSave(index)
    }
    if (e.key === 'Escape') {
      setEditingLine(null)
      setLineInput('')
    }
  }, [handleLineSave])
  
  // Static lines with EDITABLE functionality - MATCHING REFERENCE IMAGE
  if (staticLines) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-[10px] font-bold text-gray-800 mb-3 uppercase tracking-wider">Notes</h3>
        <div className="flex-1 flex flex-col justify-between">
          {Array.from({ length: LINE_COUNT }).map((_, index) => {
            const isEditing = editingLine === index
            const content = getVisibleLineContent(index)
            const range = getVisibleLineRange(index)
            
            return (
              <div key={index} className="relative group">
                {isEditing ? (
                  <input
                    type="text"
                    value={lineInput}
                    onChange={(e) => setLineInput(e.target.value)}
                    onBlur={() => handleLineSave(index)}
                    onKeyDown={(e) => handleLineKeyDown(e, index)}
                    autoFocus
                    className="w-full text-[10px] text-gray-700 bg-cyan-50 border-b border-cyan-500 focus:outline-none py-0.5 px-1"
                    placeholder={hasValidRange ? `Note for ${formatRange(selectedRange)}...` : `Memo for ${format(currentMonth, 'MMMM')}...`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLineClick(index)}
                    className="w-full text-left border-b border-gray-300 py-1 cursor-text focus:outline-none hover:border-gray-400 focus:border-cyan-400 transition-colors"
                    aria-label={content ? `Edit: ${content}` : `Line ${index + 1}`}
                    title={range ? `📅 ${formatRange(range)}` : 'Click to add note'}
                  >
                    <span className={`text-[10px] leading-tight block truncate ${content ? 'text-gray-700' : 'text-transparent'}`}>
                      {content || '.'}
                    </span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {hasValidRange && (
          <p className="text-[8px] text-cyan-600 mt-2 truncate">
            📅 {formatRange(selectedRange)}
          </p>
        )}
      </div>
    )
  }
  
  // Filter notes for mobile drawer - only show relevant to current context
  const visibleNotes = useMemo(() => {
    return notes.filter(note => {
      if (!note.range) return true // Notes without range always visible
      return isNoteVisibleForMonth(note.range, currentMonth) || 
             (hasValidRange && rangesOverlap(note.range, selectedRange))
    })
  }, [notes, currentMonth, selectedRange, hasValidRange])
  
  // Interactive notes panel (for mobile drawer)
  return (
    <div className={`bg-white rounded-lg h-full flex flex-col ${compact ? 'p-4' : 'p-6'}`}>
      <h2 className={`font-bold text-gray-900 flex-shrink-0 ${compact ? 'text-lg mb-3' : 'text-2xl mb-6'}`}>
        Notes
        <span className={`font-normal text-gray-400 ml-2 ${compact ? 'text-sm' : 'text-base'}`}>
          {format(currentMonth, 'MMM yyyy')}
        </span>
      </h2>
      
      {/* Note Input */}
      <div className={`flex-shrink-0 ${compact ? 'mb-3' : 'mb-6'}`}>
        {hasValidRange && (
          <div className={`text-cyan-600 font-medium mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {formatRange(selectedRange)}
          </div>
        )}
        
        <div className={`flex gap-2 ${compact ? 'flex-col' : ''}`}>
          <input
            id="note-input"
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                editingId ? handleUpdateNote() : handleAddNote()
              }
              if (e.key === 'Escape') {
                handleCancel()
              }
            }}
            disabled={!hasValidRange && !editingId}
            placeholder={hasValidRange ? 'Add note for dates...' : 'Select dates first'}
            className={`flex-1 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${compact ? 'py-2 text-sm' : 'py-2'}`}
          />
          
          {editingId ? (
            <div className="flex gap-2">
              <button
                onClick={handleUpdateNote}
                disabled={!noteInput.trim()}
                className={`bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className={`bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddNote}
              disabled={!hasValidRange || !noteInput.trim()}
              className={`bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${compact ? 'px-3 py-2 text-sm w-full' : 'px-4 py-2'}`}
            >
              Add
            </button>
          )}
        </div>
      </div>
      
      {/* Notes List */}
      <div className={`flex-1 overflow-y-auto min-h-0 ${compact ? 'space-y-2' : 'space-y-3'}`}>
        {visibleNotes.length === 0 ? (
          <p className={`text-gray-400 italic ${compact ? 'text-xs' : 'text-sm'}`}>
            {compact ? 'No notes for this month' : 'No notes yet. Select a date range and add a note!'}
          </p>
        ) : (
          visibleNotes.map(note => (
            <div
              key={note.id}
              className={`bg-gray-50 rounded-md border border-gray-200 hover:border-cyan-300 transition-colors group ${compact ? 'p-3' : 'p-4'}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-gray-900 font-medium mb-1 ${compact ? 'text-sm' : ''}`}>{note.content}</p>
                  {note.range && (
                    <p className={`text-cyan-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                      {formatRange(note.range)}
                    </p>
                  )}
                </div>
                
                <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${compact ? 'flex-col' : ''}`}>
                  <button
                    onClick={() => handleEditNote(note.id)}
                    className={`text-cyan-600 hover:text-cyan-700 font-medium ${compact ? 'text-xs' : 'text-sm'}`}
                    aria-label="Edit note"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className={`text-red-600 hover:text-red-700 font-medium ${compact ? 'text-xs' : 'text-sm'}`}
                    aria-label="Delete note"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

NotesPanel.displayName = 'NotesPanel'

export default NotesPanel
