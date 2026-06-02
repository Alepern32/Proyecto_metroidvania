import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import MainScene from "../game/scenes/MainScene";

function Juego({ abrirPausa, paused }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 640,
      height: 480,
      parent: containerRef.current,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 480
      },
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 1000 } }
      },
      scene: MainScene
    });

    gameRef.current = game;

    game.events.on("ready", () => {
      sceneRef.current = game.scene.getScene("Main");
    });

    function detectarEscape(event) {
      if (event.key === "Escape") abrirPausa();
    }
    window.addEventListener("keydown", detectarEscape);

    return () => {
      window.removeEventListener("keydown", detectarEscape);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    if (paused) {
      sceneRef.current.scene.pause();
    } else {
      sceneRef.current.scene.resume();
    }
  }, [paused]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
      background: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div ref={containerRef} />
      <button
        className="boton-pausa"
        onClick={abrirPausa}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 100
        }}
      >
        Pausa
      </button>
    </div>
  );
}

export default Juego;