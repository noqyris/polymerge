import { BASE_SIDES, LADDER_MIN, MAX_SIDES } from '../game/constants'
import { polygonPoints, shapeColors } from '../render/palette'

/**
 * Progress ladder for the endless game: it starts at triangle → decagon and
 * grows as you climb, always revealing one shape beyond your biggest so there
 * is always a next target to chase. Reached shapes are filled; the current
 * biggest wears an accent ring.
 */
export class Ladder {
  private root = document.getElementById('ladder')!

  update(maxSides: number) {
    const top = Math.min(MAX_SIDES, Math.max(LADDER_MIN, maxSides + 1))
    this.root.innerHTML = ''
    let currentEl: HTMLElement | null = null

    for (let sides = BASE_SIDES; sides <= top; sides++) {
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
      if (cur) currentEl = rung
    }

    // As the ladder grows past the viewport, keep the current shape in view.
    currentEl?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }
}
