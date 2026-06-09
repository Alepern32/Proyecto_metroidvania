import * as Phaser from 'phaser';
import MainScene from './scenes/MainScene';

// ── Configuración principal de Phaser ──────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  parent: "game",
  pixelArt: true,

  scale: {
    // FIT en lugar de EXPAND: evita canvas de tamaño 0 cuando el div padre
    // no tiene altura explícita, causa #1 de pantalla negra.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 480,
  },

  // ── Física arcade con gravedad ──────────────────────────────────────────
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      // debug: true,  // descomenta si quieres ver hitboxes
    },
  },

  backgroundColor: '#1a1a2e', // color de fondo mientras cargan los assets

  scene: MainScene
};

export default config;
