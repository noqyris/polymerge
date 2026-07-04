import { Preferences } from '@capacitor/preferences'

// Capacitor Preferences: native storage on iOS/Android, localStorage on web.
const BEST_KEY = 'polymerge.best'
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
