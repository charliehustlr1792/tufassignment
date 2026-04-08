// Page flip sound — uses cloned audio nodes for instant, overlap-safe playback

let audioBuffer: HTMLAudioElement | null = null
let isLoaded = false

export const preloadPageTurnSound = (): void => {
  if (typeof window === 'undefined') return

  if (!audioBuffer) {
    audioBuffer = new Audio('/sounds/page-flip.mp3')
    audioBuffer.preload = 'auto'
    audioBuffer.volume = 0.5
    audioBuffer.addEventListener('canplaythrough', () => {
      isLoaded = true
    }, { once: true })
    // Force load
    audioBuffer.load()
  }
}

export const playPageTurnSound = (): void => {
  if (typeof window === 'undefined' || !isLoaded || !audioBuffer) return

  try {
    // Clone the audio node for instant, overlap-free playback
    const clone = audioBuffer.cloneNode() as HTMLAudioElement
    clone.volume = 0.5
    clone.currentTime = 0
    clone.play().catch(() => {})
    // Clean up after playback finishes
    clone.addEventListener('ended', () => clone.remove(), { once: true })
  } catch {
    // Silently fail if audio unavailable
  }
}
