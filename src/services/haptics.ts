import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// All haptics are gated by the user's toggle. Calls are fire-and-forget and
// swallow errors — on web without vibration support they silently no-op.
let enabled = true

export function setHapticsEnabled(on: boolean) {
  enabled = on
}

export function hapticsEnabled(): boolean {
  return enabled
}

export function mergeTap() {
  if (!enabled) return
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}

export function winTap() {
  if (!enabled) return
  Haptics.notification({ type: NotificationType.Success }).catch(() => {})
}

export function gameOverTap() {
  if (!enabled) return
  Haptics.notification({ type: NotificationType.Warning }).catch(() => {})
}
