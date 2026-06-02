import * as Phaser from 'phaser';
import MainScene from './scenes/MainScene';

// ── Configuración principal de Phaser ──────────────────────────────────────
// Define el motor de renderizado, tamaño del canvas y física del juego.
const config = {
  type: Phaser.AUTO,        // Usa WebGL si está disponible, sino Canvas
  parent: "game",           // ID del div contenedor en el HTML
  pixelArt: true,           // Desactiva el antialiasing para sprites pixel-art

  scale: {
    mode: Phaser.Scale.EXPAND,              // escala manteniendo proporción
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 480,
  },

  // ── Física arcade con gravedad ──────────────────────────────────────────
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1000 } },   // Gravedad vertical aplicada a todos los cuerpos
  },

  scene: MainScene           // Escena activa al iniciar
};

export default config;
