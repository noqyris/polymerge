export type Direction = 'up' | 'down' | 'left' | 'right'

/** Random source returning [0, 1). Injectable for deterministic tests. */
export type Rng = () => number

export interface Cell {
  row: number
  col: number
}

export interface Tile extends Cell {
  /** Stable identity across moves, so the renderer can tween a tile by id. */
  id: number
  /** Number of sides — the tile's value. Triangle = 3. */
  sides: number
}

/** One tile's travel during a move. `merged` tiles vanish into a merge target. */
export interface TileMove {
  id: number
  from: Cell
  to: Cell
  merged: boolean
}

/** A merge produces a brand-new tile (`tile`) from two source tiles. */
export interface MergeEvent {
  tile: Tile
  fromIds: [number, number]
}

export interface MoveResult {
  moved: boolean
  moves: TileMove[]
  merges: MergeEvent[]
  scoreGained: number
}

/** A full turn: the move plus the tile spawned afterwards and end-state flag. */
export interface TurnResult extends MoveResult {
  spawned: Tile | null
  /** The largest polygon on the board after this turn (monotonic within a game). */
  maxSides: number
  over: boolean
}
