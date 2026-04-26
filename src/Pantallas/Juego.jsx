import * as Phaser from "phaser";
import { useEffect, useRef } from "react";
import MainScene from "../game/scenes/MainScene";

function Juego({ abrirPausa }) {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "phaser-container",
      pixelArt: true,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 } },
      },
      scene: MainScene,
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    function detectarEscape(e) {
      if (e.key === "Escape") abrirPausa();
    }
    window.addEventListener("keydown", detectarEscape);
    return () => window.removeEventListener("keydown", detectarEscape);
  }, [abrirPausa]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", position: "relative" }}>
      <div id="phaser-container" style={{ width: "100%", height: "100%" }} />
      <button
        className="boton-pausa"
        onClick={abrirPausa}
        style={{ position: "absolute", top: 20, right: 20, zIndex: 100 }}
      >
        Pausa
      </button>
    </div>
  );
}

export default Juego;
