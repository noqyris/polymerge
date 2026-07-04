/**
 * A brief, non-blocking pill that slides in over the top of the board — used
 * to celebrate a new biggest-ever polygon without interrupting play.
 */
export class Toast {
  private el: HTMLDivElement
  private timer: number | undefined

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'toast'
    this.el.setAttribute('role', 'status')
    document.querySelector('.board-wrap')?.appendChild(this.el)
  }

  show(message: string, ms = 1500) {
    window.clearTimeout(this.timer)
    this.el.textContent = message
    // Reflow so re-triggering the transition works when already shown.
    void this.el.offsetWidth
    this.el.classList.add('show')
    this.timer = window.setTimeout(() => this.el.classList.remove('show'), ms)
  }
}
