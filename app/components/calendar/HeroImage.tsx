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
      {/* Spiral binding rings — sits ABOVE the image area, not clipped */}
      <div
        className="absolute left-3 right-3 z-30 flex justify-between pointer-events-none"
        style={{ top: '-10px' }}
        aria-hidden="true"
      >
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '18px',
              borderRadius: '0 0 50% 50%',
              border: '2px solid rgba(20,20,20,0.6)',
              borderTop: 'none',
              background: 'linear-gradient(180deg, rgba(230,230,230,0.5), rgba(180,180,180,0.3))',
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Image container — overflow-hidden only here, doesn't clip spirals */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9.5' }}>
        {/* Background photo */}
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 480px"
          priority
          draggable={false}
        />

        {/* Left cyan wedge only — fully opaque, clean diagonal */}
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

        {/* Year + Month text — bottom-right, over the photo */}
        <div
          className="absolute z-20 text-right leading-none select-none"
          style={{ bottom: '14px', right: '18px' }}
        >
          <p
            className="text-white font-extrabold"
            style={{
              fontSize: 'clamp(0.95rem, 2.8vw, 1.4rem)',
              letterSpacing: '0.12em',
              lineHeight: 1.15,
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            }}
          >
            {year}
          </p>
          <p
            className="text-white font-black"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.6rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: '2px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
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
