import { WIN_SIDES } from '../game/constants'
import { shapeName } from '../render/palette'

export interface OverlayHandlers {
  onKeepGoing?: () => void
  onNewGame: () => void
}

export class Overlay {
  private root = document.getElementById('over')!
  private big = document.getElementById('over-big')!
  private small = document.getElementById('over-small')!
  private btns = document.getElementById('over-btns')!

  show(kind: 'win' | 'lose', score: number, handlers: OverlayHandlers) {
    this.btns.innerHTML = ''
    if (kind === 'win') {
      this.big.textContent = `${shapeName(WIN_SIDES)}!`
      this.small.textContent = 'You reached the goal — keep going if you can.'
      if (handlers.onKeepGoing) this.addButton('Keep going', false, handlers.onKeepGoing)
    } else {
      this.big.textContent = 'Game over'
      this.small.textContent = `Score ${score} · no moves left.`
    }
    this.addButton('New game', true, handlers.onNewGame)
    this.root.classList.add('show')
  }

  hide() {
    this.root.classList.remove('show')
  }

  private addButton(label: string, primary: boolean, onClick: () => void) {
    const b = document.createElement('button')
    b.className = primary ? 'btn primary' : 'btn'
    b.textContent = label
    b.addEventListener('click', onClick)
    this.btns.appendChild(b)
  }
}
