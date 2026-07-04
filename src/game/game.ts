import { BASE_SIDES, SPAWN_SQUARE_CHANCE, START_TILES } from './constants'
import {
  applyMove,
  canMove,
  emptyCells,
  emptyGrid,
  maxSides,
  tiles,
  type Grid,
} from './engine'
import type { Direction, Rng, Tile, TurnResult } from './types'

/**
 * Stateful game controller: owns the grid, score, the game-over flag and the
 * tile-id counter. The game is endless — there is no win state; it ends only
 * when no move is possible. Pure logic only — no rendering, no persistence,
 * injectable RNG.
 */
export class PolymergeGame {
  grid: Grid = emptyGrid()
  score = 0
  over = false

  private idCounter = 0
  private readonly rng: Rng

  constructor(rng: Rng = Math.random) {
    this.rng = rng
  }

  /** Clear the board and place the starting tiles. Returns them for rendering. */
  reset(): Tile[] {
    this.grid = emptyGrid()
    this.score = 0
    this.over = false
    const spawned: Tile[] = []
    for (let i = 0; i < START_TILES; i++) {
      const t = this.spawn()
      if (t) spawned.push(t)
    }
    return spawned
  }

  /**
   * Play one turn. Returns null if the game is over or the move changes
   * nothing (no slide, no merge) — in that case nothing spawns, as in 2048.
   */
  move(dir: Direction): TurnResult | null {
    if (this.over) return null
    const { grid, result } = applyMove(this.grid, dir, () => ++this.idCounter)
    if (!result.moved) return null

    this.grid = grid
    this.score += result.scoreGained
    const spawned = this.spawn()

    if (!canMove(this.grid)) this.over = true

    return { ...result, spawned, maxSides: this.maxSides, over: this.over }
  }

  get tiles(): Tile[] {
    return tiles(this.grid)
  }

  get maxSides(): number {
    return maxSides(this.grid)
  }

  private spawn(): Tile | null {
    const empty = emptyCells(this.grid)
    if (!empty.length) return null
    const cell = empty[Math.floor(this.rng() * empty.length)]
    const sides = this.rng() < SPAWN_SQUARE_CHANCE ? BASE_SIDES + 1 : BASE_SIDES
    const tile: Tile = { id: ++this.idCounter, sides, ...cell }
    this.grid[cell.row][cell.col] = tile
    return tile
  }
}
