// Page flip sound using custom audio file
// Add your page-flip audio file to: /public/sounds/page-flip.mp3

let audioElement: HTMLAudioElement | null = null

export const playPageTurnSound = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    // Create audio element on first use
    if (!audioElement) {
      audioElement = new Audio('/sounds/page-flip.mp3')
      audioElement.preload = 'auto'
      audioElement.volume = 0.6
    }
    
    // Reset and play
    audioElement.currentTime = 0
    audioElement.play().catch(() => {
      // Audio file not found - silently fail
      console.info('Page flip sound not found. Add audio file to /public/sounds/page-flip.mp3')
    })
  } catch (error) {
    console.debug('Audio not available:', error)
  }
}

// Preload the audio file on page load
export const preloadPageTurnSound = (): void => {
  if (typeof window === 'undefined') return
  
  if (!audioElement) {
    audioElement = new Audio('/sounds/page-flip.mp3')
    audioElement.preload = 'auto'
    audioElement.volume = 0.6
  }
}
