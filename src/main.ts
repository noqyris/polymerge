import './style.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import Phaser from 'phaser'

async function boot() {
  // Canvas text uses the bundled fonts — wait for them so numerals render correctly.
  await document.fonts.ready

  const parent = document.getElementById('board')!
  const css = parent.getBoundingClientRect().width
  const size = Math.min(1600, Math.max(512, Math.round(css * window.devicePixelRatio)))

  new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: true,
    width: size,
    height: size,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],
  })
}

boot()
