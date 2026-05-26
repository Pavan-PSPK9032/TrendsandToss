let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playPendingOrderAlert() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') return
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

    playTone(880, now, 0.2, 0.5)
    playTone(660, now + 0.2, 0.2, 0.5)
    playTone(880, now + 0.4, 0.3, 0.6)
    playTone(1100, now + 0.7, 0.3, 0.5)
    playTone(1320, now + 1.0, 0.5, 0.6)
  } catch {
    // Audio not supported
  }
}
