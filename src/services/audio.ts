/**
 * Synthesized sound palette — Web Audio only, no asset files, fully offline.
 *
 * Every sound is one "wooden pluck" instrument (triangle fundamental + a quiet
 * sine partial two octaves up for a wood-knock, through a gentle lowpass) so
 * the whole palette reads as a single calm, tactile instrument that fits the
 * drafting/geometry aesthetic. Merge pitch climbs a C-major pentatonic keyed
 * to the resulting polygon's side count, so progression is audible and any
 * combination of simultaneous merges stays consonant.
 *
 * All output is gated by the mute toggle. The AudioContext is created/resumed
 * lazily from the first user gesture to satisfy the iOS WKWebView autoplay
 * policy (see unlockAudio).
 */

const MASTER_GAIN = 0.22

// C-major pentatonic (A4=440 equal temperament), keyed to resulting side count.
// Pure pentatonic (no 4th/7th) so overlapping merges never clash. The game is
// endless, so the scale keeps climbing all the way to the biggest polygon.
const MERGE_HZ: Record<number, number> = {
  4: 261.63, // C4
  5: 293.66, // D4
  6: 329.63, // E4
  7: 392.0, // G4
  8: 440.0, // A4
  9: 523.25, // C5
  10: 587.33, // D5
  11: 659.25, // E5
  12: 783.99, // G5
  13: 880.0, // A5
  14: 1046.5, // C6
  15: 1174.66, // D6
  16: 1318.51, // E6
  17: 1567.98, // G6
  18: 1760.0, // A6
  19: 2093.0, // C7
  20: 2349.32, // D7
}

function mergeHz(sides: number): number {
  return MERGE_HZ[Math.max(4, Math.min(20, sides))] ?? MERGE_HZ[4]
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true

export function setAudioEnabled(on: boolean): void {
  enabled = on
  if (on) resumeCtx()
}

export function audioEnabled(): boolean {
  return enabled
}

type AudioCtor = typeof AudioContext

/**
 * Create the context (once) and resume it. MUST first run inside a user
 * gesture on iOS, or the context stays suspended and everything is silent.
 */
export function unlockAudio(): void {
  if (!ctx) {
    const Ctor: AudioCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = MASTER_GAIN
    master.connect(ctx.destination)
  }
  resumeCtx()
}

function resumeCtx(): void {
  if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {})
}

interface PluckOpts {
  freq: number
  /** Absolute start time on the audio clock. */
  start: number
  peak: number
  /** Seconds from attack to near-silence. */
  decay: number
  cutoff: number
  /** Wood-knock partial gain as a fraction of peak (0 disables it). */
  partial?: number
  /** Cents of detune on the fundamental for a touch of warmth. */
  detune?: number
  /** A brief upward pitch-settle on attack — tactile "landing". */
  settle?: boolean
  /** Glide the fundamental from this frequency into `freq` (downward sighs). */
  glideFrom?: number
  glideTime?: number
}

/** One pluck voice with a click-free envelope. Nodes self-dispose after stop. */
function pluck(o: PluckOpts): void {
  if (!ctx || !master) return
  const t = o.start

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = o.cutoff
  lp.Q.value = 0.6
  lp.connect(master)

  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  if (o.detune) osc.detune.value = o.detune
  if (o.glideFrom) {
    osc.frequency.setValueAtTime(o.glideFrom, t)
    osc.frequency.exponentialRampToValueAtTime(o.freq, t + (o.glideTime ?? 0.4))
  } else if (o.settle) {
    osc.frequency.setValueAtTime(o.freq * 1.008, t)
    osc.frequency.exponentialRampToValueAtTime(o.freq, t + 0.025)
  } else {
    osc.frequency.setValueAtTime(o.freq, t)
  }

  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(o.peak, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0006, t + o.decay)
  osc.connect(g)
  g.connect(lp)
  osc.start(t)
  osc.stop(t + o.decay + 0.03)

  if (o.partial && o.partial > 0) {
    const knockDecay = Math.min(o.decay, 0.09)
    const p = ctx.createOscillator()
    p.type = 'sine'
    p.frequency.value = o.freq * 4
    const pg = ctx.createGain()
    pg.gain.setValueAtTime(0.0001, t)
    pg.gain.linearRampToValueAtTime(o.peak * o.partial, t + 0.003)
    pg.gain.exponentialRampToValueAtTime(0.0005, t + knockDecay)
    p.connect(pg)
    pg.connect(lp)
    p.start(t)
    p.stop(t + knockDecay + 0.03)
  }
}

/** A soft sine body pad under the win arpeggio. */
function pad(freq: number, start: number, peak: number, dur: number, cutoff: number): void {
  if (!ctx || !master) return
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = cutoff
  lp.Q.value = 0.5
  lp.connect(master)
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.linearRampToValueAtTime(peak, start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0005, start + dur)
  osc.connect(g)
  g.connect(lp)
  osc.start(start)
  osc.stop(start + dur + 0.03)
}

/**
 * Play one pluck per merge that happened this move, low→high, lightly
 * staggered so a cascade layers into a gentle run instead of a loud stack.
 */
export function playMerge(sidesList: number[]): void {
  if (!enabled || !ctx || sidesList.length === 0) return
  const t0 = ctx.currentTime
  const ordered = [...sidesList].sort((a, b) => a - b)
  ordered.forEach((sides, k) => {
    pluck({
      freq: mergeHz(sides),
      start: t0 + k * 0.02,
      peak: Math.max(0.15, 0.3 * Math.pow(0.85, k)),
      decay: 0.19,
      cutoff: 3200,
      partial: 0.16,
      detune: 6,
      settle: true,
    })
  })
}

/** A dull, quiet, muffled low tap — background texture that never fatigues. */
export function playSpawn(): void {
  if (!enabled || !ctx) return
  pluck({
    freq: 196.0, // G3
    glideFrom: 233.08, // Bb3 → G3, a "placed" downward nudge
    glideTime: 0.06,
    start: ctx.currentTime,
    peak: 0.05,
    decay: 0.08,
    cutoff: 900,
  })
}

/** Ascending C-major arpeggio pooling into a resolved chord over a soft pad. */
export function playWin(): void {
  if (!enabled || !ctx) return
  const t0 = ctx.currentTime
  const notes: [number, number, number, number][] = [
    // freq, start offset, peak, decay
    [523.25, 0.0, 0.16, 0.45], // C5
    [659.25, 0.1, 0.15, 0.45], // E5
    [783.99, 0.2, 0.14, 0.42], // G5
    [1046.5, 0.3, 0.16, 0.55], // C6 (resolve, rings longest)
  ]
  for (const [f, off, peak, decay] of notes) {
    pluck({ freq: f, start: t0 + off, peak, decay, cutoff: 3600, partial: 0.15 })
  }
  pad(261.63, t0, 0.06, 0.9, 3000) // C4 body
}

/** Soft descending pluck settling to a low tonic — a graceful "done". */
export function playGameOver(): void {
  if (!enabled || !ctx) return
  const t0 = ctx.currentTime
  pluck({ freq: 220.0, start: t0, peak: 0.15, decay: 0.4, cutoff: 1100, partial: 0.1 }) // A3
  pluck({ freq: 164.81, start: t0 + 0.16, peak: 0.13, decay: 0.45, cutoff: 1100, partial: 0.1 }) // E3
  pluck({
    freq: 130.81, // C3
    glideFrom: 138.59, // faint downward sigh into the tonic
    glideTime: 0.5,
    start: t0 + 0.34,
    peak: 0.12,
    decay: 0.6,
    cutoff: 1100,
    partial: 0.1,
  })
}

/**
 * DEV/test-only: render a sound in an OfflineAudioContext and return its peak
 * amplitude, exercising the exact recipe above. `respectMute` lets a test
 * confirm the mute gate silences output.
 */
export async function renderSample(
  kind: 'merge' | 'spawn' | 'win' | 'gameover',
  sides: number[] = [6],
  respectMute = false,
): Promise<number> {
  const OAC: typeof OfflineAudioContext | undefined =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext
  if (!OAC) return -1

  const savedCtx = ctx
  const savedMaster = master
  const savedEnabled = enabled
  const off = new OAC(1, Math.ceil(44100 * 1.2), 44100)
  ctx = off as unknown as AudioContext
  master = off.createGain()
  master.gain.value = MASTER_GAIN
  master.connect(off.destination)
  if (!respectMute) enabled = true

  if (kind === 'merge') playMerge(sides)
  else if (kind === 'spawn') playSpawn()
  else if (kind === 'win') playWin()
  else playGameOver()

  const rendered = await off.startRendering()
  ctx = savedCtx
  master = savedMaster
  enabled = savedEnabled

  const data = rendered.getChannelData(0)
  let peak = 0
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]))
  return peak
}
