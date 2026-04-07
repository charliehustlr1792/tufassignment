'use client'

import { memo } from 'react'

const NotesSection = memo(() => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 mb-4 tracking-wide">Notes</h3>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-px bg-gray-300 w-full"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
})

NotesSection.displayName = 'NotesSection'

export default NotesSection
