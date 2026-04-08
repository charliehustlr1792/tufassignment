'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { Note, DateRange } from '@/app/types/calendar'
import { saveNotes, loadNotes } from '@/app/utils/localStorage'

interface NotesPanelProps {
  selectedRange: DateRange
  currentMonth: Date
}

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

const LINE_COUNT = 8

const NotesPanel = memo(({ selectedRange, currentMonth }: NotesPanelProps) => {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes())
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [lineInput, setLineInput] = useState('')

  const monthKey = format(currentMonth, 'yyyy-MM')
  const effectiveRange: DateRange = selectedRange.start && !selectedRange.end
    ? { start: selectedRange.start, end: selectedRange.start }
    : selectedRange
  const hasRange = !!effectiveRange.start

  useEffect(() => { saveNotes(notes) }, [notes])

  const visibleNotes = useMemo(() =>
    notes.filter(n => {
      if (!n.range) return format(new Date(n.createdAt), 'yyyy-MM') === monthKey
      return (
        isNoteVisibleForMonth(n.range, currentMonth) ||
        (hasRange && rangesOverlap(n.range, effectiveRange))
      )
    }),
    [notes, currentMonth, effectiveRange, hasRange, monthKey]
  )

  const lineNoteMap = useMemo(() => {
    const map: Record<number, Note> = {}
    visibleNotes.forEach((n, idx) => {
      if (idx < LINE_COUNT) map[idx] = n
    })
    return map
  }, [visibleNotes])

  const handleLineClick = useCallback((lineIdx: number) => {
    setEditingLine(lineIdx)
    setLineInput(lineNoteMap[lineIdx]?.content ?? '')
  }, [lineNoteMap])

  const handleLineSave = useCallback((lineIdx: number) => {
    const content = lineInput.trim()
    setEditingLine(null)
    setLineInput('')
    if (!content) {
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
        range: hasRange ? { ...effectiveRange } : null,
        createdAt: Date.now(),
      }])
    }
  }, [lineInput, lineNoteMap, hasRange, effectiveRange])

  const handleLineKeyDown = useCallback((e: React.KeyboardEvent, lineIdx: number) => {
    if (e.key === 'Enter') { e.preventDefault(); handleLineSave(lineIdx) }
    if (e.key === 'Escape') { setEditingLine(null); setLineInput('') }
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

  return (
    <div className="flex flex-col h-full">
      <div className="text-gray-700 font-semibold text-xs tracking-[0.11em]">
        Notes
      </div>

      <div className="flex flex-col gap-0 flex-1">
        {Array.from({ length: LINE_COUNT }).map((_, idx) => {
          const note = lineNoteMap[idx]
          const isEditing = editingLine === idx

          return (
            <div
              key={idx}
              className="relative h-6"
            >
              {isEditing ? (
                <input
                  type="text"
                  value={lineInput}
                  autoFocus
                  onChange={e => setLineInput(e.target.value)}
                  onBlur={() => handleLineSave(idx)}
                  onKeyDown={e => handleLineKeyDown(e, idx)}
                  className="absolute inset-0 w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 px-0 text-[10px] font-body border-b border-cyan-500 pb-px leading-5.5"
                  placeholder={hasRange ? formatRangeShort(effectiveRange) : '…'}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleLineClick(idx)}
                  className="absolute inset-0 w-full text-left bg-transparent focus:outline-none group border-b border-gray-300 pb-px"
                  aria-label={note ? `Edit note: ${note.content}` : `Add note on line ${idx + 1}`}
                  title={note?.range ? `${formatRangeShort(note.range)}` : undefined}
                >
                  {note ? (
                    <span
                      className="block truncate text-gray-700 group-hover:text-cyan-600 transition-colors text-[10px] leading-5.5 font-body"
                    >
                      {note.content}
                    </span>
                  ) : (
                    <span
                      className="block opacity-0 group-hover:opacity-30 transition-opacity text-gray-400 text-[10px] leading-5.5"
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

      {hasRange && (
        <div className="mt-2 text-cyan-600 font-semibold truncate text-[8px] tracking-[0.05em]" title={`Selected: ${formatRangeShort(effectiveRange)}`}>
          {formatRangeShort(effectiveRange)}
        </div>
      )}
    </div>
  )
})

NotesPanel.displayName = 'NotesPanel'

export default NotesPanel