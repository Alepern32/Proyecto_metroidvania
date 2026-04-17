import { useEffect } from "react";

function Juego({ abrirPausa }) {
  useEffect(() => {
    function detectarEscape(event) {
      if (event.key === "Escape") {
        abrirPausa();
      }
    }

    window.addEventListener("keydown", detectarEscape);

    return () => {
      window.removeEventListener("keydown", detectarEscape);
    };
  }, [abrirPausa]);

  return (
    <div className="pantalla-juego">
      <div className="fondo-juego-prueba">
        <div className="hud-prueba">
          <span>❤️ Vida: 100</span>
          <span>🪙 Oro: 250</span>
        </div>

        <div className="contenido-juego-prueba">
          <h1>Mapa del juego</h1>
          <p>Aquí se cargará el mapa y el personaje.</p>
          <p>Pulsa ESC para abrir el menú de pausa.</p>
        </div>

        <button className="boton-pausa" onClick={abrirPausa}>
          Pausa
        </button>
      </div>
    </div>
  );
}

export default Juego;