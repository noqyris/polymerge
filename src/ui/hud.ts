import { shapeName } from '../render/palette'

export class Hud {
  private scoreEl = document.getElementById('score')!
  private bestEl = document.getElementById('best')!
  private topEl = document.getElementById('top')!

  update(score: number, best: number, maxSides: number) {
    this.scoreEl.textContent = String(score)
    this.bestEl.textContent = String(best)
    this.topEl.textContent = maxSides > 0 ? shapeName(maxSides) : '—'
  }
}
