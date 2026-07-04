import Phaser from 'phaser'
import { ensureTileTexture } from './tileTextures'

/**
 * One tile: a single Image backed by a pre-rendered, soft-shadowed polygon
 * texture (see ensureTileTexture). Kept as a Container so slide/pop/spawn
 * tweens act on position and scale uniformly.
 */
export class TileView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, cell: number, sides: number) {
    super(scene, x, y)
    const { key } = ensureTileTexture(scene, sides, cell)
    this.add(new Phaser.GameObjects.Image(scene, 0, 0, key))
    scene.add.existing(this)
  }
}
