import Phaser from 'phaser'
import { hexToNumber, polygonPoints, shapeColors } from './palette'

/**
 * One tile: rounded card, crisp regular polygon, and a small side-count
 * numeral in the corner (keeps 9 vs 10 distinguishable). All vector-drawn.
 */
export class TileView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, cell: number, sides: number) {
    super(scene, x, y)

    const [bgHex, inkHex] = shapeColors(sides)
    const bg = hexToNumber(bgHex)
    const ink = hexToNumber(inkHex)
    const half = cell / 2

    const g = new Phaser.GameObjects.Graphics(scene)
    g.fillStyle(bg, 1)
    g.fillRoundedRect(-half, -half, cell, cell, cell * 0.09)

    const points = polygonPoints(sides, 0, 0, cell * 0.36)
    g.fillStyle(ink, 1)
    g.fillPoints(points, true)
    // Slight same-color stroke softens polygon corners, like the SVG original.
    g.lineStyle(Math.max(1, cell * 0.02), ink, 1)
    g.strokePoints(points, true, true)
    this.add(g)

    const label = new Phaser.GameObjects.Text(
      scene,
      -half + cell * 0.07,
      -half + cell * 0.05,
      String(sides),
      {
        fontFamily: "'Space Mono', ui-monospace, monospace",
        fontStyle: 'bold',
        fontSize: `${Math.max(10, Math.round(cell * 0.11))}px`,
        color: inkHex,
      },
    )
    label.setAlpha(0.55)
    this.add(label)

    scene.add.existing(this)
  }
}
