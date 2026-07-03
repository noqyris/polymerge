import { describe, expect, it } from 'vitest'
import { GRID_SIZE, START_TILES, WIN_SIDES } from './constants'
import { PolymergeGame } from './game'
import type { Rng } from './types'

/** Deterministic rng cycling through the given values. */
function seq(...values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]
}

describe('PolymergeGame', () => {
  it('reset places the starting tiles', () => {
    const game = new PolymergeGame(seq(0.5))
    const spawned = game.reset()
    expect(spawned).toHaveLength(START_TILES)
    expect(game.tiles).toHaveLength(START_TILES)
    expect(game.score).toBe(0)
  })

  it('spawns 90% triangles, 10% squares', () => {
    // spawn() draws rng twice: cell pick, then shape pick.
    const triangles = new PolymergeGame(seq(0.0, 0.95)).reset()
    expect(triangles.every((t) => t.sides === 3)).toBe(true)
    const squares = new PolymergeGame(seq(0.0, 0.05)).reset()
    expect(squares.every((t) => t.sides === 4)).toBe(true)
  })

  it('a turn that changes nothing returns null and spawns nothing', () => {
    const game = new PolymergeGame(seq(0.5))
    game.reset()
    game.grid = gridOf([
      [3, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const before = game.tiles.length
    expect(game.move('left')).toBeNull()
    expect(game.tiles).toHaveLength(before)
  })

  it('a moving turn scores, spawns exactly one tile, and reports events', () => {
    const game = new PolymergeGame(seq(0.5))
    game.reset()
    game.grid = gridOf([
      [3, 0, 0, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const turn = game.move('left')!
    expect(turn.scoreGained).toBe(4)
    expect(game.score).toBe(4)
    expect(turn.spawned).not.toBeNull()
    expect(game.tiles).toHaveLength(2) // merged tile + spawn
  })

  it('sets justWon exactly on the turn the first WIN_SIDES tile appears', () => {
    const game = new PolymergeGame(seq(0.0, 0.5))
    game.reset()
    game.grid = gridOf([
      [WIN_SIDES - 1, 0, 0, WIN_SIDES - 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const winTurn = game.move('left')!
    expect(winTurn.justWon).toBe(true)
    expect(game.won).toBe(true)

    const later = game.move('right')!
    expect(later.justWon).toBe(false)
    expect(game.won).toBe(true)
  })

  it('ends the game when the post-spawn board has no move left', () => {
    // rng: cell pick (single empty cell), then 0.05 → square spawn.
    const game = new PolymergeGame(seq(0.0, 0.05))
    game.reset()
    game.grid = gridOf([
      [3, 4, 3, 4],
      [4, 3, 4, 3],
      [3, 4, 3, 4],
      [4, 4, 6, 5],
    ])
    const turn = game.move('right')!
    expect(turn.over).toBe(true)
    expect(game.over).toBe(true)
    expect(game.move('left')).toBeNull()
  })
})

function gridOf(rows: number[][]) {
  let id = 100
  return rows.map((r, row) =>
    r.map((sides, col) => (sides > 0 ? { id: id++, sides, row, col } : null)),
  )
}

it('GRID_SIZE stays 4 — the tests above encode 4×4 boards', () => {
  expect(GRID_SIZE).toBe(4)
})
