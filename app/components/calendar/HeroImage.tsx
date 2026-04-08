'use client'

import { memo } from 'react'
import { format } from 'date-fns'

interface HeroImageProps {
  currentMonth: Date
}

const MONTH_IMAGES: Record<number, { url: string; alt: string }> = {
  0: { url: '/months/arrays.png', alt: 'Snowy winter mountain' },
  1: { url: '/months/binarysearch.png', alt: 'Foggy winter forest' },
  2: { url: '/months/recursion.png', alt: 'Cherry blossoms spring' },
  3: { url: '/months/linkedlist.png', alt: 'Green meadows April' },
  4: { url: '/months/bitmanipulation.png', alt: 'Lush forest May' },
  5: { url: '/months/greedy.png', alt: 'Tropical beach June' },
  6: { url: '/months/twopointers.png', alt: 'Sunny coastal cliffs July' },
  7: { url: '/months/stack.png', alt: 'Golden wheat fields August' },
  8: { url: '/months/binarytrees.png', alt: 'Autumn leaves September' },
  9: { url: '/months/graphs.png', alt: 'Orange autumn forest October' },
  10: { url: '/months/dp.png', alt: 'Misty mountain November' },
  11: { url: '/months/tries.png', alt: 'Snowy pine forest December' },
}

const HeroImage = memo(({ currentMonth }: HeroImageProps) => {
  const monthIndex = currentMonth.getMonth()
  const image = MONTH_IMAGES[monthIndex]
  const monthName = format(currentMonth, 'MMMM').toUpperCase()
  const year = format(currentMonth, 'yyyy')

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>

      {/* ── Background photo ── */}
      <img
        src={image.url}
        alt={image.alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />

      {/*
        ════════════════════════════════════════════════════
        CHEVRON V-SHAPE — two overlays anchored to bottom

        LEFT  → diagonal wedge from left edge to center-bottom
        RIGHT → large trapezoid covering right side with text

        The V-gap between them reveals the photo.
        The shapes extend to the very bottom so there is
        no straight photo edge visible beneath.
        ════════════════════════════════════════════════════
      */}

      {/* LEFT chevron — diagonal wedge, bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: '55%',
          clipPath: 'polygon(0% 0%, 46% 100%, 0% 100%)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.97), rgba(8, 145, 178, 0.95))',
        }}
      />

      {/* RIGHT chevron — large trapezoid, right side with year/month */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: '55%',
          clipPath: 'polygon(54% 100%, 68% 0%, 100% 0%, 100% 100%)',
          background: 'linear-gradient(225deg, rgba(6, 182, 212, 0.97), rgba(8, 145, 178, 0.95))',
        }}
      >
        {/*
          Year + Month — positioned bottom-right in the
          safe flat area of the trapezoid.
          Year is now large & bold to match reference.
        */}
        <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-5 text-right leading-none select-none">
          <p
            className="text-white font-extrabold tracking-[0.15em]"
            style={{
              fontSize: 'clamp(0.95rem, 3.2vw, 1.35rem)',
              lineHeight: 1.1,
              textShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            {year}
          </p>
          <p
            className="text-white font-black tracking-tight"
            style={{
              fontSize: 'clamp(1.6rem, 5.5vw, 2.5rem)',
              lineHeight: 1,
              marginTop: '0.1rem',
              textShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            {monthName}
          </p>
        </div>
      </div>

      {/* ── Spiral binding — top edge decoration ── */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none"
        style={{ gap: '10px', paddingTop: '2px' }}
        aria-hidden="true"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '11px',
              height: '14px',
              borderRadius: '0 0 50% 50%',
              border: '2px solid rgba(140,140,140,0.45)',
              borderTop: 'none',
              background: 'rgba(200,200,200,0.25)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
})

HeroImage.displayName = 'HeroImage'

export default HeroImage