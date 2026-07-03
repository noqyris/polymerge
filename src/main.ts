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
  gameOverTap,
  hapticsEnabled,
  mergeTap,
  setHapticsEnabled,
  winTap,
} from './services/haptics'
import {
  loadBest,
  loadHapticsEnabled,
  saveBest,
  saveHapticsEnabled,
} from './services/storage'
import { Hud } from './ui/hud'
import { Ladder } from './ui/ladder'
import { Overlay } from './ui/overlay'

async function boot() {
  // Canvas numerals use the bundled fonts — wait so first paint is correct.
  await document.fonts.ready.catch(() => {})

  const [best0, hapticsOn] = await Promise.all([loadBest(), loadHapticsEnabled()])
  setHapticsEnabled(hapticsOn)

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
    onMergePop: () => mergeTap(),
    onTurn: (turn) => {
      syncHud()
      if (turn.justWon) {
        winTap()
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

  const hapticsBtn = document.getElementById('haptics')!
  hapticsBtn.setAttribute('aria-pressed', String(hapticsEnabled()))
  hapticsBtn.addEventListener('click', () => {
    const on = !hapticsEnabled()
    setHapticsEnabled(on)
    hapticsBtn.setAttribute('aria-pressed', String(on))
    void saveHapticsEnabled(on)
    if (on) mergeTap() // confirm with the same tap merges use
  })

  syncHud()

  if (import.meta.env.DEV) {
    // Hook for automated in-browser smoke tests.
    ;(window as unknown as Record<string, unknown>).__polymerge = { logic, scene }
  }
}

void boot()
