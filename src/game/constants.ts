/** Board is GRID_SIZE × GRID_SIZE. */
export const GRID_SIZE = 4

/** The base tile — a triangle. */
export const BASE_SIDES = 3

/**
 * Highest polygon the game can represent (distinct colour + name). The game
 * is endless — the point is to make the biggest polygon you can — so this is
 * just the ceiling of the art, set safely above what a 4×4 board can reach.
 */
export const MAX_SIDES = 20

/** The progress ladder always spans at least triangle → this, then grows. */
export const LADDER_MIN = 10

/** Chance that a spawned tile is a square instead of a triangle. */
export const SPAWN_SQUARE_CHANCE = 0.1

/** Tiles placed on a fresh board. */
export const START_TILES = 2
