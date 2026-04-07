export type DateRange = {
  start: Date | null
  end: Date | null
}

export type Note = {
  id: string
  content: string
  range: DateRange | null
  createdAt: number
}

export type DayState = 
  | 'default'
  | 'hover'
  | 'today'
  | 'selected-start'
  | 'selected-end'
  | 'in-range'
  | 'disabled'
