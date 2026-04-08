import { Note } from '../types/calendar'

const STORAGE_KEY = 'calendar_notes_v1'

const hasStorage = (): boolean => {
  if (typeof window === 'undefined') return false
  const storage = window.localStorage as Storage | undefined
  return !!storage
    && typeof storage.getItem === 'function'
    && typeof storage.setItem === 'function'
}

export const saveNotes = (notes: Note[]): void => {
  try {
    if (!hasStorage()) return
    const serialized = JSON.stringify(notes.map(note => ({
      ...note,
      range: note.range ? {
        start: note.range.start?.toISOString() ?? null,
        end: note.range.end?.toISOString() ?? null,
      } : null,
    })))
    window.localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save notes:', error)
  }
}

export const loadNotes = (): Note[] => {
  try {
    if (!hasStorage()) return []
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    return parsed.map((note: Note & { range: { start: string | null; end: string | null } | null }) => ({
      ...note,
      range: note.range ? {
        start: note.range.start ? new Date(note.range.start) : null,
        end: note.range.end ? new Date(note.range.end) : null,
      } : null,
    }))
  } catch (error) {
    console.error('Failed to load notes:', error)
    return []
  }
}
