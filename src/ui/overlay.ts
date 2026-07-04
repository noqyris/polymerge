import { shapeName } from '../render/palette'

export interface GameOverData {
  biggestSides: number
  score: number
  recordSides: number
  isRecord: boolean
}

/** The end-of-run screen. The game is endless, so it celebrates how far you got. */
export class Overlay {
  private root = document.getElementById('over')!
  private big = document.getElementById('over-big')!
  private small = document.getElementById('over-small')!
  private btns = document.getElementById('over-btns')!

  show(data: GameOverData, onNewGame: () => void) {
    this.big.textContent = shapeName(data.biggestSides)
    this.small.textContent = data.isRecord
      ? `Your biggest yet · score ${data.score} · new record!`
      : `Biggest this run · score ${data.score} · best ${shapeName(data.recordSides)}`

    this.btns.innerHTML = ''
    const b = document.createElement('button')
    b.className = 'btn primary'
    b.textContent = 'New game'
    b.addEventListener('click', onNewGame)
    this.btns.appendChild(b)

    this.root.classList.add('show')
  }

  hide() {
    this.root.classList.remove('show')
  }
}
