import { Preferences } from '@capacitor/preferences'

// Capacitor Preferences: native storage on iOS/Android, localStorage on web.
const BEST_KEY = 'polymerge.best'
const HAPTICS_KEY = 'polymerge.haptics'

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

export async function loadHapticsEnabled(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: HAPTICS_KEY })
    return value !== 'off'
  } catch {
    return true
  }
}

export async function saveHapticsEnabled(on: boolean): Promise<void> {
  try {
    await Preferences.set({ key: HAPTICS_KEY, value: on ? 'on' : 'off' })
  } catch {
    // non-fatal
  }
}
