/** [tile background, ink] per side-count — ported from the poligoni.html prototype. */
export const SHAPE_COLORS: Record<number, [string, string]> = {
  3: ['#E7E3DB', '#2B2F36'],
  4: ['#DEE9F6', '#23517F'],
  5: ['#DDF1EA', '#1B6B54'],
  6: ['#EBF2DA', '#4C6B18'],
  7: ['#FBF0D5', '#8A5A12'],
  8: ['#FAE6DE', '#9E4A2C'],
  9: ['#F8E4EC', '#9A3557'],
  10: ['#E9E6FB', '#4A3EA0'],
  11: ['#F0DFF4', '#6B4BB0'],
  12: ['#E3DCF3', '#3B2E86'],
}

const FALLBACK: [string, string] = ['#E3DCF3', '#3B2E86']

export const SLOT_COLOR = '#ECEEF1'

export function shapeColors(sides: number): [string, string] {
  return SHAPE_COLORS[sides] ?? FALLBACK
}

const SHAPE_NAMES: Record<number, string> = {
  3: 'Triangle',
  4: 'Square',
  5: 'Pentagon',
  6: 'Hexagon',
  7: 'Heptagon',
  8: 'Octagon',
  9: 'Nonagon',
  10: 'Decagon',
  11: 'Hendecagon',
  12: 'Dodecagon',
}

export function shapeName(sides: number): string {
  return SHAPE_NAMES[sides] ?? `${sides}-gon`
}

/**
 * Vertices of a regular polygon, first vertex pointing up, so every shape
 * shares a consistent orientation.
 */
export function polygonPoints(
  sides: number,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number }[] {
  const offset = -Math.PI / 2
  return Array.from({ length: sides }, (_, i) => {
    const angle = offset + (i * 2 * Math.PI) / sides
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  })
}

export function hexToNumber(hex: string): number {
  return parseInt(hex.slice(1), 16)
}
