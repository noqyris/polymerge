import { BASE_SIDES, WIN_SIDES } from '../game/constants'
import { polygonPoints, shapeColors } from '../render/palette'

/**
 * Compact progress ladder, triangle → win shape. Reached shapes are filled,
 * the current max wears an accent ring.
 */
export class Ladder {
  private root = document.getElementById('ladder')!

  update(maxSides: number) {
    this.root.innerHTML = ''
    for (let sides = BASE_SIDES; sides <= WIN_SIDES; sides++) {
      const [bg, ink] = shapeColors(sides)
      const on = sides <= maxSides
      const cur = sides === maxSides
      const stroke = on ? ink : 'rgba(25,29,35,.16)'
      const points = polygonPoints(sides, 50, 50, 34)
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ')

      const rung = document.createElement('div')
      rung.className = `rung${on ? ' on' : ''}${cur ? ' cur' : ''}`
      rung.innerHTML =
        `<svg viewBox="0 0 100 100" aria-hidden="true">` +
        `<polygon points="${points}" fill="${on ? bg : 'transparent'}" stroke="${stroke}" ` +
        `stroke-width="${on ? 6 : 5}" stroke-linejoin="round"/></svg>` +
        `<div class="lab">${sides}</div>`
      this.root.appendChild(rung)
    }
  }
}
