import { GRID_SIZE } from './constants'
import type { Cell, Direction, MergeEvent, MoveResult, Tile, TileMove } from './types'

export type Grid = (Tile | null)[][]

export function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array<Tile | null>(GRID_SIZE).fill(null))
}

export function tiles(grid: Grid): Tile[] {
  const out: Tile[] = []
  for (const row of grid) for (const t of row) if (t) out.push(t)
  return out
}

export function emptyCells(grid: Grid): Cell[] {
  const out: Cell[] = []
  for (let row = 0; row < GRID_SIZE; row++)
    for (let col = 0; col < GRID_SIZE; col++)
      if (!grid[row][col]) out.push({ row, col })
  return out
}

export function maxSides(grid: Grid): number {
  return tiles(grid).reduce((m, t) => Math.max(m, t.sides), 0)
}

export function hasSides(grid: Grid, sides: number): boolean {
  return tiles(grid).some((t) => t.sides === sides)
}

/** A move exists if any cell is empty or any two adjacent tiles match. */
export function canMove(grid: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const t = grid[row][col]
      if (!t) return true
      if (col + 1 < GRID_SIZE && grid[row][col + 1]?.sides === t.sides) return true
      if (row + 1 < GRID_SIZE && grid[row + 1][col]?.sides === t.sides) return true
    }
  }
  return false
}

/**
 * The lines of cells for a direction, each ordered from the edge tiles slide
 * toward. Sliding left → each row, columns 0..3; sliding down → each column,
 * rows 3..0; etc.
 */
function traversalLines(dir: Direction): Cell[][] {
  const idx = [...Array(GRID_SIZE).keys()]
  const rev = [...idx].reverse()
  switch (dir) {
    case 'left':
      return idx.map((row) => idx.map((col) => ({ row, col })))
    case 'right':
      return idx.map((row) => rev.map((col) => ({ row, col })))
    case 'up':
      return idx.map((col) => idx.map((row) => ({ row, col })))
    case 'down':
      return idx.map((col) => rev.map((row) => ({ row, col })))
  }
}

/**
 * Slide and merge every tile in `dir`, 2048-style: within each line, tiles
 * pair up starting from the edge they slide toward, each tile merges at most
 * once, and a merge yields a new tile with one more side. Pure — returns a
 * fresh grid plus per-tile move/merge events for the renderer to animate.
 * `nextId` supplies ids for tiles created by merges.
 */
export function applyMove(
  grid: Grid,
  dir: Direction,
  nextId: () => number,
): { grid: Grid; result: MoveResult } {
  const next = emptyGrid()
  const moves: TileMove[] = []
  const merges: MergeEvent[] = []
  let scoreGained = 0
  let moved = false

  for (const line of traversalLines(dir)) {
    const lineTiles = line
      .map(({ row, col }) => grid[row][col])
      .filter((t): t is Tile => t !== null)
    let slot = 0
    for (let i = 0; i < lineTiles.length; i++) {
      const tile = lineTiles[i]
      const partner = lineTiles[i + 1]
      const target = line[slot]
      if (partner && partner.sides === tile.sides) {
        const merged: Tile = { id: nextId(), sides: tile.sides + 1, ...target }
        next[target.row][target.col] = merged
        moves.push({ id: tile.id, from: at(tile), to: target, merged: true })
        moves.push({ id: partner.id, from: at(partner), to: target, merged: true })
        merges.push({ tile: merged, fromIds: [tile.id, partner.id] })
        scoreGained += merged.sides
        moved = true
        i++
      } else {
        next[target.row][target.col] = { ...tile, ...target }
        if (tile.row !== target.row || tile.col !== target.col) {
          moves.push({ id: tile.id, from: at(tile), to: target, merged: false })
          moved = true
        }
      }
      slot++
    }
  }

  return { grid: next, result: { moved, moves, merges, scoreGained } }
}

function at(tile: Tile): Cell {
  return { row: tile.row, col: tile.col }
}
