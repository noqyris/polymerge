import { describe, expect, it } from 'vitest'
import { applyMove, canMove, emptyCells, emptyGrid, maxSides, type Grid } from './engine'
import type { Tile } from './types'

/** Build a grid from a 4×4 matrix of side-counts (0 = empty). Ids are 1-based reading order. */
function grid(rows: number[][]): Grid {
  const g = emptyGrid()
  let id = 0
  rows.forEach((r, row) =>
    r.forEach((sides, col) => {
      id++
      if (sides > 0) g[row][col] = { id, sides, row, col }
    }),
  )
  return g
}

function values(g: Grid): number[][] {
  return g.map((row) => row.map((t) => t?.sides ?? 0))
}

function idGen(start = 1000) {
  let n = start
  return () => ++n
}

describe('applyMove', () => {
  it('slides tiles to the far edge without merging different shapes', () => {
    const g = grid([
      [0, 3, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 5, 0],
      [0, 0, 0, 0],
    ])
    const { grid: next, result } = applyMove(g, 'left', idGen())
    expect(values(next)).toEqual([
      [3, 4, 0, 0],
      [0, 0, 0, 0],
      [5, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(result.moved).toBe(true)
    expect(result.merges).toEqual([])
    expect(result.scoreGained).toBe(0)
  })

  it('merges two equal shapes into one with an extra side and scores its side-count', () => {
    const g = grid([
      [3, 0, 0, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { grid: next, result } = applyMove(g, 'left', idGen())
    expect(values(next)[0]).toEqual([4, 0, 0, 0])
    expect(result.merges).toHaveLength(1)
    expect(result.merges[0].tile.sides).toBe(4)
    expect(result.scoreGained).toBe(4)
  })

  it('pairs from the edge tiles slide toward: [3,3,3] left → [4,3]', () => {
    const g = grid([
      [3, 3, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { grid: next } = applyMove(g, 'left', idGen())
    expect(values(next)[0]).toEqual([4, 3, 0, 0])
  })

  it('pairs from the right edge on a right move: [3,3,3] right → [3,4]', () => {
    const g = grid([
      [3, 3, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { grid: next } = applyMove(g, 'right', idGen())
    expect(values(next)[0]).toEqual([0, 0, 3, 4])
  })

  it('merges each pair once and never chains: [3,3,3,3] → [4,4], [4,3,3] → [4,4]', () => {
    const quad = applyMove(
      grid([
        [3, 3, 3, 3],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]),
      'left',
      idGen(),
    )
    expect(values(quad.grid)[0]).toEqual([4, 4, 0, 0])
    expect(quad.result.scoreGained).toBe(8)

    const chain = applyMove(
      grid([
        [4, 3, 3, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]),
      'left',
      idGen(),
    )
    // The freshly created 4 must NOT merge with the existing 4 this turn.
    expect(values(chain.grid)[0]).toEqual([4, 4, 0, 0])
  })

  it('handles vertical moves', () => {
    const g = grid([
      [3, 0, 0, 0],
      [3, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 5, 0, 0],
    ])
    const down = applyMove(g, 'down', idGen())
    expect(values(down.grid)).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 5, 0, 0],
    ])
    const up = applyMove(g, 'up', idGen())
    expect(values(up.grid)).toEqual([
      [4, 5, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
  })

  it('reports moved=false when nothing changes', () => {
    const g = grid([
      [3, 4, 0, 0],
      [5, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { result } = applyMove(g, 'left', idGen())
    expect(result.moved).toBe(false)
    expect(result.moves).toEqual([])
  })

  it('keeps tile ids stable through slides and reports from/to for the renderer', () => {
    const g = emptyGrid()
    const slider: Tile = { id: 7, sides: 5, row: 2, col: 3 }
    g[2][3] = slider
    const { grid: next, result } = applyMove(g, 'left', idGen())
    expect(next[2][0]).toMatchObject({ id: 7, sides: 5, row: 2, col: 0 })
    expect(result.moves).toEqual([
      { id: 7, from: { row: 2, col: 3 }, to: { row: 2, col: 0 }, merged: false },
    ])
  })

  it('marks both merge sources with merged=true and mints a new id for the result', () => {
    const g = emptyGrid()
    g[0][1] = { id: 1, sides: 3, row: 0, col: 1 }
    g[0][3] = { id: 2, sides: 3, row: 0, col: 3 }
    const { result } = applyMove(g, 'left', idGen(1000))
    const mergedMoves = result.moves.filter((m) => m.merged)
    expect(mergedMoves.map((m) => m.id).sort()).toEqual([1, 2])
    expect(mergedMoves.every((m) => m.to.row === 0 && m.to.col === 0)).toBe(true)
    expect(result.merges[0].tile.id).toBe(1001)
    expect(result.merges[0].fromIds).toEqual([1, 2])
  })
})

describe('canMove', () => {
  it('is true while any cell is empty', () => {
    expect(canMove(emptyGrid())).toBe(true)
  })

  it('is true on a full board with an adjacent equal pair', () => {
    const g = grid([
      [3, 4, 3, 4],
      [4, 3, 4, 3],
      [3, 4, 3, 4],
      [4, 3, 4, 4],
    ])
    expect(canMove(g)).toBe(true)
  })

  it('is false on a full board with no adjacent equals', () => {
    const g = grid([
      [3, 4, 3, 4],
      [4, 3, 4, 3],
      [3, 4, 3, 4],
      [4, 3, 4, 3],
    ])
    expect(canMove(g)).toBe(false)
  })
})

describe('grid helpers', () => {
  it('emptyCells and maxSides', () => {
    const g = grid([
      [3, 0, 0, 0],
      [0, 8, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(emptyCells(g)).toHaveLength(14)
    expect(maxSides(g)).toBe(8)
  })
})
