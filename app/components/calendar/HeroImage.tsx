'use client'

import { memo } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'

interface HeroImageProps {
  currentMonth: Date
}

export const MONTH_IMAGES: Record<number, { url: string; alt: string }> = {
  0: { url: '/months/arrays.png', alt: 'Arrays' },
  1: { url: '/months/binarysearch.png', alt: 'Binary Search' },
  2: { url: '/months/recursion.png', alt: 'Recursion' },
  3: { url: '/months/linkedlist.png', alt: 'LinkedList' },
  4: { url: '/months/bitmanipulation.png', alt: 'Bit Manipulation' },
  5: { url: '/months/greedy.png', alt: 'Greedy' },
  6: { url: '/months/twopointers.png', alt: 'Two pointers' },
  7: { url: '/months/stack.png', alt: 'Stack' },
  8: { url: '/months/binarytrees.png', alt: 'Binary Trees' },
  9: { url: '/months/graphs.png', alt: 'Graphs' },
  10: { url: '/months/dp.png', alt: 'Dynamic Programming' },
  11: { url: '/months/tries.png', alt: 'Tries' },
}

const HeroImage = memo(({ currentMonth }: HeroImageProps) => {
  const monthIndex = currentMonth.getMonth()
  const image = MONTH_IMAGES[monthIndex]
  const monthName = format(currentMonth, 'MMMM').toUpperCase()
  const year = format(currentMonth, 'yyyy')

  return (
    <div className="relative w-full">
      <div
        className="absolute -top-2.5 left-3 right-3 z-30 flex justify-between pointer-events-none"
        aria-hidden="true"
      >
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-4.5 rounded-b-full border-2 border-[rgba(20,20,20,0.6)] border-t-0 bg-[linear-gradient(180deg,rgba(230,230,230,0.5),rgba(180,180,180,0.3))] shrink-0"
          />
        ))}
      </div>

      <div className="relative w-full overflow-hidden aspect-16/9.5">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 480px"
          priority
          draggable={false}
        />

        <svg
          className="absolute inset-0 w-full h-full z-10"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="0,300 0,600 520,600"
            fill="#0891b2"
          />
        </svg>

        <div
          className="absolute z-20 text-right leading-none select-none bottom-3.5 right-4.5"
        >
          <p className="text-white text-[clamp(0.95rem,2.8vw,1.4rem)] tracking-[0.12em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
            {year}
          </p>
          <p
            className="text-white font-black text-[clamp(1.5rem,5vw,2.6rem)] tracking-[0.05em] leading-none mt-0.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
          >
            {monthName}
          </p>
        </div>
      </div>
    </div>
  )
})

HeroImage.displayName = 'HeroImage'

export default HeroImage
