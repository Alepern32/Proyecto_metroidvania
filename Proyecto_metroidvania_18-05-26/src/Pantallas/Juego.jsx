import * as Phaser from "phaser";
import { useEffect, useRef } from "react";
import MainScene from "../game/scenes/MainScene";

function Juego({ abrirPausa, esNuevaPartida, juegoPausado }) {
  const gameRef = useRef(null);

  // Crear el juego
  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: "phaser-container",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 480,
      },
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 } },
      },
      input: {
        keyboard: {
          target: window,
          preventDefault: true,
        },
      },
      callbacks: {
        preBoot: (game) => {
          game.registry.set("esNuevaPartida", esNuevaPartida);
        },
      },
      scene: MainScene,
    };

    gameRef.current = new Phaser.Game(config);
    window.__phaserGame = gameRef.current;

    // FORZAR EL FOCO DEL TECLADO JUSTO DESPUÉS DE CREAR EL JUEGO
    setTimeout(() => {
      if (gameRef.current && gameRef.current.canvas) {
        gameRef.current.canvas.focus();
      }
    }, 50);

    // Limpieza al desmontar
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        window.__phaserGame = null;
      }
    };
  }, []);

  // Controlar pausa/reanudación
  useEffect(() => {
    if (!gameRef.current) return;
    if (juegoPausado) {
      gameRef.current.loop.sleep();
    } else {
      gameRef.current.loop.wake();
      // Forzar foco al reanudar
      setTimeout(() => {
        const canvas = gameRef.current?.canvas;
        if (canvas) {
          canvas.setAttribute("tabindex", "0");
          canvas.focus({ preventScroll: true });
        }
      }, 100);
    }
  }, [juegoPausado]);

  // Capturar tecla Escape
  useEffect(() => {
    function detectarEscape(e) {
      if (e.key === "Escape" && !juegoPausado) {
        if (gameRef.current) gameRef.current.loop.sleep();
        abrirPausa();
      }
    }
    window.addEventListener("keydown", detectarEscape);
    return () => window.removeEventListener("keydown", detectarEscape);
  }, [abrirPausa, juegoPausado]);

  function handleAbrirPausa() {
    if (gameRef.current && !juegoPausado) {
      gameRef.current.loop.sleep();
      abrirPausa();
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      <div id="phaser-container" style={{ width: "100%", height: "100%" }} />
      <button
        className="boton-pausa"
        onClick={(e) => {
          e.stopPropagation();
          handleAbrirPausa();
        }}
        style={{ position: "absolute", top: 20, right: 20, zIndex: 100 }}
      >
        Pausa
      </button>
    </div>
  );
}

export default Juego;
