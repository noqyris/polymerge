import Phaser from 'phaser'
import { darken, lighten, polygonPoints, shapeColors, withAlpha } from './palette'

const SHADOW = 'rgba(25,29,35,0.20)'

export function tileTextureKey(sides: number, cell: number): string {
  return `tile:${sides}:${Math.round(cell)}`
}

function tracePolygon(
  ctx: CanvasRenderingContext2D,
  sides: number,
  cx: number,
  cy: number,
  radius: number,
): void {
  const pts = polygonPoints(sides, cx, cy, radius)
  ctx.beginPath()
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
  ctx.closePath()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Generate (once) a richly rendered texture for one shape at the current cell
 * size, cached in Phaser's texture manager. Each tile is a soft-shadowed card
 * with a gentle gradient, a gradient-filled polygon with a crisp edge, a faint
 * concentric "construction" line for the drafting feel, and a corner numeral.
 * Returns the texture key and its square pixel size (larger than the cell to
 * leave room for the shadow).
 */
export function ensureTileTexture(
  scene: Phaser.Scene,
  sides: number,
  cell: number,
): { key: string; size: number } {
  const cs = Math.round(cell)
  const pad = Math.round(cs * 0.11)
  const size = cs + pad * 2
  const key = tileTextureKey(sides, cell)
  if (scene.textures.exists(key)) return { key, size }

  const tex = scene.textures.createCanvas(key, size, size)
  if (!tex) return { key, size }
  const ctx = tex.context
  const [bgHex, inkHex] = shapeColors(sides)
  const x0 = pad
  const y0 = pad
  const r = cs * 0.09
  const cx = size / 2
  const cy = size / 2

  ctx.clearRect(0, 0, size, size)

  // Card with a soft drop shadow for depth.
  ctx.save()
  ctx.shadowColor = SHADOW
  ctx.shadowBlur = cs * 0.1
  ctx.shadowOffsetY = cs * 0.045
  roundRect(ctx, x0, y0, cs, cs, r)
  const card = ctx.createLinearGradient(0, y0, 0, y0 + cs)
  card.addColorStop(0, lighten(bgHex, 0.05))
  card.addColorStop(1, darken(bgHex, 0.02))
  ctx.fillStyle = card
  ctx.fill()
  ctx.restore()

  // Faint glass highlight down the top half.
  ctx.save()
  roundRect(ctx, x0, y0, cs, cs, r)
  ctx.clip()
  const hi = ctx.createLinearGradient(0, y0, 0, y0 + cs * 0.5)
  hi.addColorStop(0, 'rgba(255,255,255,0.45)')
  hi.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hi
  ctx.fillRect(x0, y0, cs, cs * 0.5)
  ctx.restore()

  // Polygon: vertical gradient fill + crisp stroke.
  const pr = cs * 0.31
  tracePolygon(ctx, sides, cx, cy, pr)
  const poly = ctx.createLinearGradient(0, cy - pr, 0, cy + pr)
  poly.addColorStop(0, lighten(inkHex, 0.24))
  poly.addColorStop(1, inkHex)
  ctx.fillStyle = poly
  ctx.fill()
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(1, cs * 0.016)
  ctx.strokeStyle = darken(inkHex, 0.06)
  ctx.stroke()

  // Faint concentric construction polygon — drafting/geometry motif.
  tracePolygon(ctx, sides, cx, cy, pr * 0.52)
  ctx.lineWidth = Math.max(1, cs * 0.007)
  ctx.strokeStyle = withAlpha(lighten(inkHex, 0.45), 0.55)
  ctx.stroke()

  // Corner numeral so 9 vs 10 stay distinguishable.
  ctx.font = `700 ${Math.round(cs * 0.12)}px 'Space Mono', ui-monospace, monospace`
  ctx.textBaseline = 'top'
  ctx.fillStyle = withAlpha(inkHex, 0.55)
  ctx.fillText(String(sides), x0 + cs * 0.08, y0 + cs * 0.07)

  tex.refresh()
  return { key, size }
}
