import Phaser from 'phaser'
import { GRID_SIZE } from '../game/constants'
import type { PolymergeGame } from '../game/game'
import type { Direction, Tile, TileMove, TurnResult } from '../game/types'
import { hexToNumber, shapeColors, SLOT_COLOR } from './palette'
import { TileView } from './TileView'

// Board geometry, as fractions of the (square) canvas — matches the prototype.
const PAD_FRAC = 0.026
const GAP_FRAC = 0.026

/** Minimum swipe travel, in CSS pixels. */
const SWIPE_MIN = 24

const SLIDE_MS = 110
const POP_MS = 150
const SPAWN_MS = 170
const SPAWN_DELAY_MS = 30

export interface GameSceneHooks {
  /** Fired once per turn, the moment merged tiles pop in (haptics hook). */
  onMergePop: (turn: TurnResult) => void
  /** Fired after a turn's animation fully settles. */
  onTurn: (turn: TurnResult) => void
}

export class GameScene extends Phaser.Scene {
  private views = new Map<number, TileView>()
  private locked = false
  private queued: Direction | null = null
  private acceptInput = true
  private reduceMotion = false

  constructor(
    private logic: PolymergeGame,
    private hooks: GameSceneHooks,
  ) {
    super('game')
  }

  create() {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    this.reduceMotion = media?.matches ?? false
    media?.addEventListener?.('change', (e) => (this.reduceMotion = e.matches))

    this.drawSlots()
    for (const tile of this.logic.tiles) this.addTileView(tile)

    const kb = this.input.keyboard
    if (kb) {
      kb.addCapture('UP,DOWN,LEFT,RIGHT,W,A,S,D')
      const bind = (keys: string[], dir: Direction) =>
        keys.forEach((k) => kb.on(`keydown-${k}`, () => this.tryMove(dir)))
      bind(['LEFT', 'A'], 'left')
      bind(['RIGHT', 'D'], 'right')
      bind(['UP', 'W'], 'up')
      bind(['DOWN', 'S'], 'down')
    }

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Pointer coords are in game space; convert the CSS-px threshold.
      const display = this.scale.displaySize.width
      const perCss = display > 0 ? this.scale.gameSize.width / display : 1
      const dx = pointer.upX - pointer.downX
      const dy = pointer.upY - pointer.downY
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN * perCss) return
      const dir: Direction =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      this.tryMove(dir)
    })
  }

  /** Gate all move input (used while an overlay is up). */
  setInputEnabled(on: boolean) {
    this.acceptInput = on
    if (!on) this.queued = null
  }

  /** Clear the board, reset the logic, and animate the fresh start tiles in. */
  newGame() {
    this.queued = null
    this.locked = false
    this.views.forEach((v) => v.destroy())
    this.views.clear()
    for (const tile of this.logic.reset()) void this.spawnIn(this.addTileView(tile))
  }

  tryMove(dir: Direction) {
    if (!this.acceptInput) return
    if (this.locked) {
      this.queued = dir // buffer one input so fast play feels responsive
      return
    }
    const turn = this.logic.move(dir)
    if (!turn) return
    void this.animateTurn(turn)
  }

  private async animateTurn(turn: TurnResult) {
    this.locked = true

    await Promise.all(turn.moves.map((m) => this.slideView(m)))

    const settles: Promise<void>[] = []
    for (const merge of turn.merges) {
      for (const id of merge.fromIds) {
        this.views.get(id)?.destroy()
        this.views.delete(id)
      }
      settles.push(this.popIn(this.addTileView(merge.tile)))
      // Score gained per merge is the new tile's side count.
      this.floatScore(merge.tile.row, merge.tile.col, merge.tile.sides)
    }
    if (turn.merges.length) this.hooks.onMergePop(turn)
    if (turn.spawned) settles.push(this.spawnIn(this.addTileView(turn.spawned), SPAWN_DELAY_MS))
    await Promise.all(settles)

    this.locked = false
    this.hooks.onTurn(turn)

    if (this.queued) {
      const dir = this.queued
      this.queued = null
      this.tryMove(dir)
    }
  }

  // ---- geometry -----------------------------------------------------------

  private get boardSize() {
    return this.scale.gameSize.width
  }

  private get cellSize() {
    const s = this.boardSize
    return (s * (1 - 2 * PAD_FRAC - (GRID_SIZE - 1) * GAP_FRAC)) / GRID_SIZE
  }

  private cellCenter(row: number, col: number) {
    const s = this.boardSize
    const cell = this.cellSize
    const step = cell + s * GAP_FRAC
    const pad = s * PAD_FRAC
    return { x: pad + col * step + cell / 2, y: pad + row * step + cell / 2 }
  }

  // ---- drawing & animation ------------------------------------------------

  private drawSlots() {
    const g = this.add.graphics()
    const cell = this.cellSize
    g.fillStyle(hexToNumber(SLOT_COLOR), 1)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const { x, y } = this.cellCenter(row, col)
        g.fillRoundedRect(x - cell / 2, y - cell / 2, cell, cell, cell * 0.09)
      }
    }
  }

  /** A small "+N" annotation that drifts up from a merge and fades out. */
  private floatScore(row: number, col: number, amount: number) {
    const { x, y } = this.cellCenter(row, col)
    const [, inkHex] = shapeColors(amount)
    const label = this.add
      .text(x, y - this.cellSize * 0.12, `+${amount}`, {
        fontFamily: "'Space Mono', ui-monospace, monospace",
        fontStyle: 'bold',
        fontSize: `${Math.round(this.cellSize * 0.2)}px`,
        color: inkHex,
      })
      .setOrigin(0.5)
      .setDepth(10)

    if (this.reduceMotion) {
      this.tweens.add({ targets: label, alpha: 0, duration: 260, delay: 200, onComplete: () => label.destroy() })
      return
    }
    label.setScale(0.7)
    this.tweens.add({
      targets: label,
      y: y - this.cellSize * 0.62,
      scale: 1,
      alpha: { from: 1, to: 0 },
      duration: 560,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    })
  }

  private addTileView(tile: Tile): TileView {
    const { x, y } = this.cellCenter(tile.row, tile.col)
    const view = new TileView(this, x, y, this.cellSize, tile.sides)
    this.views.set(tile.id, view)
    return view
  }

  private slideView(move: TileMove): Promise<void> {
    const view = this.views.get(move.id)
    if (!view) return Promise.resolve()
    const { x, y } = this.cellCenter(move.to.row, move.to.col)
    if (this.reduceMotion || (view.x === x && view.y === y)) {
      view.setPosition(x, y)
      return Promise.resolve()
    }
    return new Promise((resolve) =>
      this.tweens.add({
        targets: view,
        x,
        y,
        duration: SLIDE_MS,
        ease: 'Quad.easeInOut',
        onComplete: () => resolve(),
      }),
    )
  }

  private popIn(view: TileView): Promise<void> {
    if (this.reduceMotion) return Promise.resolve()
    view.setScale(0.55)
    return new Promise((resolve) =>
      this.tweens.add({
        targets: view,
        scale: 1,
        duration: POP_MS,
        ease: 'Back.easeOut',
        onComplete: () => resolve(),
      }),
    )
  }

  private spawnIn(view: TileView, delay = 0): Promise<void> {
    if (this.reduceMotion) return Promise.resolve()
    view.setScale(0.2)
    return new Promise((resolve) =>
      this.tweens.add({
        targets: view,
        scale: 1,
        duration: SPAWN_MS,
        delay,
        ease: 'Back.easeOut',
        onComplete: () => resolve(),
      }),
    )
  }
}
