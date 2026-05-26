let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

export function playPendingOrderAlert() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const playTone = (freq, startTime, duration, gainValue = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(gainValue, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    playTone(880, now, 0.3, 0.4)
    playTone(660, now + 0.3, 0.3, 0.4)
    playTone(880, now + 0.6, 0.5, 0.5)
    playTone(1100, now + 1.1, 0.4, 0.4)
  } catch {
    // Audio not supported
  }
}
