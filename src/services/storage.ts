import { Preferences } from '@capacitor/preferences'

// Capacitor Preferences: native storage on iOS/Android, localStorage on web.
const BEST_KEY = 'polymerge.best'
// Biggest polygon (side count) ever made — the endless game's headline record.
const RECORD_KEY = 'polymerge.record'
// One "mute" preference gates both sound and haptics.
const SOUND_KEY = 'polymerge.sound'

export async function loadBest(): Promise<number> {
  try {
    const { value } = await Preferences.get({ key: BEST_KEY })
    return value ? Number(value) || 0 : 0
  } catch {
    return 0
  }
}

export async function saveBest(best: number): Promise<void> {
  try {
    await Preferences.set({ key: BEST_KEY, value: String(best) })
  } catch {
    // non-fatal: the game just won't remember the best score
  }
}

export async function loadRecordSides(): Promise<number> {
  try {
    const { value } = await Preferences.get({ key: RECORD_KEY })
    return value ? Number(value) || 0 : 0
  } catch {
    return 0
  }
}

export async function saveRecordSides(sides: number): Promise<void> {
  try {
    await Preferences.set({ key: RECORD_KEY, value: String(sides) })
  } catch {
    // non-fatal
  }
}

export async function loadSoundEnabled(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: SOUND_KEY })
    return value !== 'off'
  } catch {
    return true
  }
}

export async function saveSoundEnabled(on: boolean): Promise<void> {
  try {
    await Preferences.set({ key: SOUND_KEY, value: on ? 'on' : 'off' })
  } catch {
    // non-fatal
  }
}
