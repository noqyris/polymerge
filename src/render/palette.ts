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
  // Endless — the palette keeps going around the wheel past the old target.
  13: ['#D6EFEC', '#12726B'],
  14: ['#DCEAF7', '#215C99'],
  15: ['#E9E1F5', '#5E3AA6'],
  16: ['#F6E0EF', '#93276E'],
  17: ['#F7DEDE', '#9E2B2B'],
  18: ['#DEEEDD', '#256B36'],
  19: ['#F5EBD0', '#8A6A12'],
  20: ['#E2E6EC', '#2E3A4A'],
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
  13: 'Tridecagon',
  14: 'Tetradecagon',
  15: 'Pentadecagon',
  16: 'Hexadecagon',
  17: 'Heptadecagon',
  18: 'Octadecagon',
  19: 'Nonadecagon',
  20: 'Icosagon',
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

interface Rgb {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex({ r, g, b }: Rgb): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/** Mix a colour toward white by `amt` (0..1). */
export function lighten(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: r + (255 - r) * amt, g: g + (255 - g) * amt, b: b + (255 - b) * amt })
}

/** Mix a colour toward black by `amt` (0..1). */
export function darken(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: r * (1 - amt), g: g * (1 - amt), b: b * (1 - amt) })
}

/** An `rgba()` string for a hex colour at the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}
