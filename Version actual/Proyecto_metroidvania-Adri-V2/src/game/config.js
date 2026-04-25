import * as Phaser from 'phaser';
import MainScene from './scenes/MainScene';

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  parent: "game",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1000 } }
  },
  scene: MainScene
};

export default config;