'use client'

import { memo } from 'react'
import { formatMonthYear } from '@/app/utils/dateUtils'

interface HeroImageProps {
  currentMonth: Date
  imageSrc?: string
}

const HeroImage = memo(({ currentMonth, imageSrc }: HeroImageProps) => {
  const monthYear = formatMonthYear(currentMonth)
  const [month, year] = monthYear.split(' ')
  
  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
      {/* Background Image */}
      <div className="absolute inset-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Calendar for ${monthYear}`}
            className="w-full h-full object-cover"
          />
        ) : (
          // Placeholder gradient when no image
          <div className="w-full h-full bg-gradient-to-br from-slate-400 via-slate-300 to-gray-300" />
        )}
      </div>
      
      {/* LEFT: Blue angled/tilted trapezoid shape */}
      <div 
        className="absolute bottom-0 left-0 w-[35%] h-[70%] bg-cyan-500 origin-bottom-left"
        style={{
          clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      />
      
      {/* WHITE: Diagonal accent cutting through */}
      <div 
        className="absolute bottom-0 left-[25%] w-[25%] h-[60%]"
        style={{
          clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%, 0% 100%)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        }}
      />
      
      {/* RIGHT: Blue section with month/year */}
      <div 
        className="absolute bottom-0 right-0 w-[55%] h-[45%] bg-cyan-500"
        style={{
          clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        {/* Month and Year Text - positioned inside */}
        <div className="absolute right-4 sm:right-6 md:right-8 bottom-4 sm:bottom-6 md:bottom-8 text-right">
          <div className="text-white text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">
            {year}
          </div>
          <div className="text-white text-lg sm:text-xl md:text-2xl font-black tracking-widest mt-1">
            {month}
          </div>
        </div>
      </div>
    </div>
  )
})

HeroImage.displayName = 'HeroImage'

export default HeroImage
