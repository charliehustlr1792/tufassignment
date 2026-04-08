'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { Note, DateRange } from '@/app/types/calendar'
import { saveNotes, loadNotes } from '@/app/utils/localStorage'

interface NotesPanelProps {
  selectedRange: DateRange
  currentMonth: Date
}

// ── helpers ────────────────────────────────────────────────────────────────

const isNoteVisibleForMonth = (noteRange: DateRange | null | undefined, month: Date): boolean => {
  if (!noteRange?.start || !noteRange?.end) return false
  const ms = startOfMonth(month)
  const me = endOfMonth(month)
  const ns = new Date(noteRange.start)
  const ne = new Date(noteRange.end)
  return (
    isWithinInterval(ns, { start: ms, end: me }) ||
    isWithinInterval(ne, { start: ms, end: me }) ||
    (ns <= ms && ne >= me)
  )
}

const rangesOverlap = (r1: DateRange | null | undefined, r2: DateRange): boolean => {
  if (!r1?.start || !r1?.end || !r2.start || !r2.end) return false
  return new Date(r1.start) <= new Date(r2.end!) && new Date(r1.end) >= new Date(r2.start!)
}

const formatRangeShort = (range: DateRange): string => {
  if (!range.start || !range.end) return ''
  const s = new Date(range.start)
  const e = new Date(range.end)
  if (s.getTime() === e.getTime()) return format(s, 'MMM d')
  return `${format(s, 'MMM d')}–${format(e, 'd')}`
}

// Number of ruled lines shown — matches reference image
const LINE_COUNT = 6

// ── component ──────────────────────────────────────────────────────────────

const NotesPanel = memo(({ selectedRange, currentMonth }: NotesPanelProps) => {
  const [notes, setNotes] = useState<Note[]>([])
  // Which line index is being edited
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [lineInput, setLineInput] = useState('')

  const monthKey = format(currentMonth, 'yyyy-MM')
  const hasRange = !!(selectedRange.start && selectedRange.end)

  // ── persistence ──────────────────────────────────────────────────────────
  useEffect(() => { setNotes(loadNotes()) }, [])
  useEffect(() => { saveNotes(notes) }, [notes])

  // ── line notes: filter to only those relevant this month / range ─────────
  const visibleNotes = useMemo(() =>
    notes.filter(n => {
      // Notes without a range belong to their creation month
      if (!n.range) return format(new Date(n.createdAt), 'yyyy-MM') === monthKey
      return (
        isNoteVisibleForMonth(n.range, currentMonth) ||
        (hasRange && rangesOverlap(n.range, selectedRange))
      )
    }),
    [notes, currentMonth, selectedRange, hasRange, monthKey]
  )

  // Map line index → note content for quick lookup
  const lineNoteMap = useMemo(() => {
    const map: Record<number, Note> = {}
    visibleNotes.forEach((n, idx) => {
      if (idx < LINE_COUNT) map[idx] = n
    })
    return map
  }, [visibleNotes])

  // ── actions ───────────────────────────────────────────────────────────────
  const handleLineClick = useCallback((lineIdx: number) => {
    setEditingLine(lineIdx)
    setLineInput(lineNoteMap[lineIdx]?.content ?? '')
  }, [lineNoteMap])

  const handleLineSave = useCallback((lineIdx: number) => {
    const content = lineInput.trim()
    setEditingLine(null)
    setLineInput('')
    if (!content) {
      // Delete note at this line if it existed
      const existing = lineNoteMap[lineIdx]
      if (existing) setNotes(prev => prev.filter(n => n.id !== existing.id))
      return
    }

    const existing = lineNoteMap[lineIdx]
    if (existing) {
      setNotes(prev => prev.map(n => n.id === existing.id ? { ...n, content } : n))
    } else {
      setNotes(prev => [...prev, {
        id: `note-${Date.now()}`,
        content,
        range: hasRange ? { ...selectedRange } : null,
        createdAt: Date.now(),
      }])
    }
  }, [lineInput, lineNoteMap, hasRange, selectedRange])

  const handleLineKeyDown = useCallback((e: React.KeyboardEvent, lineIdx: number) => {
    if (e.key === 'Enter') { e.preventDefault(); handleLineSave(lineIdx) }
    if (e.key === 'Escape') { setEditingLine(null); setLineInput('') }
    // Tab to next line
    if (e.key === 'Tab') {
      e.preventDefault()
      handleLineSave(lineIdx)
      const next = lineIdx + 1
      if (next < LINE_COUNT) {
        setTimeout(() => {
          setEditingLine(next)
          setLineInput(lineNoteMap[next]?.content ?? '')
        }, 0)
      }
    }
  }, [handleLineSave, lineNoteMap])

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* "Notes" header — small caps, matching reference */}
      <div
        className="text-gray-700 font-semibold mb-2"
        style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' }}
      >
        Notes
      </div>

      {/* Ruled lines */}
      <div className="flex flex-col gap-0" style={{ flex: 1 }}>
        {Array.from({ length: LINE_COUNT }).map((_, idx) => {
          const note = lineNoteMap[idx]
          const isEditing = editingLine === idx

          return (
            <div
              key={idx}
              className="relative"
              // Each line is a fixed height — tight ruled paper spacing
              style={{ height: '22px' }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={lineInput}
                  autoFocus
                  onChange={e => setLineInput(e.target.value)}
                  onBlur={() => handleLineSave(idx)}
                  onKeyDown={e => handleLineKeyDown(e, idx)}
                  className="absolute inset-0 w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 px-0"
                  style={{
                    fontSize: '9.5px',
                    fontFamily: "'Outfit', sans-serif",
                    borderBottom: '1px solid #06b6d4',
                    paddingBottom: '1px',
                    lineHeight: '20px',
                  }}
                  placeholder={hasRange ? formatRangeShort(selectedRange) : '…'}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleLineClick(idx)}
                  className="absolute inset-0 w-full text-left bg-transparent focus:outline-none group"
                  style={{
                    borderBottom: '1px solid #d1d5db',
                    paddingBottom: '1px',
                  }}
                  aria-label={note ? `Edit note: ${note.content}` : `Add note on line ${idx + 1}`}
                  title={note?.range ? `📅 ${formatRangeShort(note.range)}` : undefined}
                >
                  {note ? (
                    <span
                      className="block truncate text-gray-700 group-hover:text-cyan-600 transition-colors"
                      style={{ fontSize: '9.5px', lineHeight: '19px', fontFamily: "'Outfit', sans-serif" }}
                    >
                      {note.content}
                    </span>
                  ) : (
                    // Empty line — show faint + on hover
                    <span
                      className="block opacity-0 group-hover:opacity-30 transition-opacity text-gray-400"
                      style={{ fontSize: '9.5px', lineHeight: '19px' }}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Range tag — shown below lines when a range is selected */}
      {hasRange && (
        <div
          className="mt-2 text-cyan-600 font-semibold truncate"
          style={{ fontSize: '8px', letterSpacing: '0.05em' }}
          title={`Selected: ${formatRangeShort(selectedRange)}`}
        >
          📅 {formatRangeShort(selectedRange)}
        </div>
      )}
    </div>
  )
})

NotesPanel.displayName = 'NotesPanel'

export default NotesPanel