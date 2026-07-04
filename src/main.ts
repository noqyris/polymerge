import './style.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import Phaser from 'phaser'
import { BASE_SIDES, WIN_SIDES } from './game/constants'
import { PolymergeGame } from './game/game'
import { GameScene } from './render/GameScene'
import { shapeName } from './render/palette'
import {
  audioEnabled,
  playGameOver,
  playMerge,
  playSpawn,
  playWin,
  renderSample,
  setAudioEnabled,
  unlockAudio,
} from './services/audio'
import { gameOverTap, mergeTap, setHapticsEnabled, winTap } from './services/haptics'
import { loadBest, loadSoundEnabled, saveBest, saveSoundEnabled } from './services/storage'
import { Hud } from './ui/hud'
import { Ladder } from './ui/ladder'
import { Overlay } from './ui/overlay'

async function boot() {
  // Canvas numerals use the bundled fonts — wait so first paint is correct.
  await document.fonts.ready.catch(() => {})

  // One toggle mutes both sound and haptics.
  const [best0, soundOn] = await Promise.all([loadBest(), loadSoundEnabled()])
  setAudioEnabled(soundOn)
  setHapticsEnabled(soundOn)

  // iOS/Chrome autoplay policy: the AudioContext can only start from a user
  // gesture, so arm it on the first interaction of any kind.
  const unlock = () => unlockAudio()
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
  window.addEventListener('touchstart', unlock, { once: true, passive: true })

  // Keep goal-dependent copy in sync with WIN_SIDES.
  const goal = shapeName(WIN_SIDES).toLowerCase()
  document.querySelector('.eyebrow')!.textContent = `merge puzzle · ${BASE_SIDES}→${WIN_SIDES}`
  document.querySelector('.sub')!.textContent =
    `Merge two matching shapes — every merge adds a side. Reach the ${goal}.`
  document.querySelector('.foot')!.textContent = `swipe · arrows / wasd · goal: ${goal}`

  const logic = new PolymergeGame()
  const hud = new Hud()
  const ladder = new Ladder()
  const overlay = new Overlay()

  let best = best0
  const syncHud = () => {
    if (logic.score > best) {
      best = logic.score
      void saveBest(best)
    }
    hud.update(logic.score, best, logic.maxSides)
    ladder.update(logic.maxSides)
  }

  logic.reset() // scene renders the starting tiles in create()

  const newGame = () => {
    overlay.hide()
    scene.setInputEnabled(true)
    scene.newGame()
    syncHud()
  }

  const scene = new GameScene(logic, {
    onMergePop: (turn) => {
      mergeTap()
      // One note per merge, pitched to the resulting polygon (rises with sides).
      playMerge(turn.merges.map((m) => m.tile.sides))
    },
    onTurn: (turn) => {
      syncHud()
      // A quiet spawn tick only when nothing merged, so every move has exactly
      // one clear sound (merges already spoke in onMergePop).
      if (turn.merges.length === 0 && turn.spawned) playSpawn()
      if (turn.justWon) {
        winTap()
        playWin()
        scene.setInputEnabled(false)
        overlay.show('win', logic.score, {
          onKeepGoing: () => {
            overlay.hide()
            scene.setInputEnabled(true)
          },
          onNewGame: newGame,
        })
      } else if (turn.over) {
        gameOverTap()
        playGameOver()
        overlay.show('lose', logic.score, { onNewGame: newGame })
      }
    },
  })

  const parent = document.getElementById('board')!
  // Size the logical canvas to device pixels so polygons and text stay crisp
  // on retina screens; Scale.FIT keeps it fitted to the CSS box afterwards.
  const cssWidth = parent.getBoundingClientRect().width || 400
  const size = Math.min(1600, Math.max(512, Math.round(cssWidth * window.devicePixelRatio)))

  new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: true,
    banner: false,
    width: size,
    height: size,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [scene],
  })

  document.getElementById('new')!.addEventListener('click', newGame)

  const soundBtn = document.getElementById('sound')!
  soundBtn.setAttribute('aria-pressed', String(audioEnabled()))
  soundBtn.addEventListener('click', () => {
    const on = !audioEnabled()
    setAudioEnabled(on)
    setHapticsEnabled(on)
    soundBtn.setAttribute('aria-pressed', String(on))
    void saveSoundEnabled(on)
    if (on) {
      unlockAudio()
      mergeTap()
      playMerge([4]) // confirm with a single tap tone
    }
  })

  syncHud()

  if (import.meta.env.DEV) {
    // Hook for automated in-browser smoke tests.
    ;(window as unknown as Record<string, unknown>).__polymerge = {
      logic,
      scene,
      ladder,
      audio: { renderSample, setAudioEnabled, unlockAudio },
    }
  }
}

void boot()
