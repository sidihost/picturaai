/* Web Audio API sound effects for Pictura - no external files needed */

let audioCtx: AudioContext | null = null

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

/** Soft ascending chime when image is generated */
export function playSuccessSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    // Two-note ascending chime
    const notes = [523.25, 659.25] // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.12)
      gain.gain.setValueAtTime(0, now + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.12)
      osc.stop(now + i * 0.12 + 0.6)
    })
  } catch {
    // Silently fail if audio not available
  }
}

/** Low-tone "limit reached" alert */
export function playLimitSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    // Two descending tones
    const notes = [440, 349.23] // A4, F4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.15)
      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.15 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.5)
    })
  } catch {
    // Silently fail
  }
}
