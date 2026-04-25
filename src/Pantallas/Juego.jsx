import { useEffect } from "react";

function Juego({ abrirPausa, datosJugador }) {
  useEffect(() => {
    // Este bloque detecta cuando se pulsa la tecla Escape
    function detectarEscape(event) {
      if (event.key === "Escape") {
        abrirPausa();
      }
    }

    // Aquí activo el evento del teclado
    window.addEventListener("keydown", detectarEscape);

    // Aquí limpio el evento cuando se sale de esta pantalla
    return () => {
      window.removeEventListener("keydown", detectarEscape);
    };
  }, [abrirPausa]);

  return (
    <div className="pantalla-juego">
      <div className="fondo-juego-prueba">
        {/* Este bloque muestra la vida, el oro y el nivel del jugador */}
        <div className="hud-prueba">
          <span>❤️ Vida: {datosJugador.vida}</span>
          <span>🪙 Oro: {datosJugador.oro}</span>
          <span>⭐ Nivel: {datosJugador.nivel}</span>
        </div>

        {/* Esta parte es provisional hasta conectar el mapa real del juego */}
        <div className="contenido-juego-prueba">
          <h1>Mapa del juego</h1>
          <p>Aquí se cargará el mapa y el personaje.</p>
          <p>Pulsa ESC para abrir el menú de pausa.</p>
        </div>

        {/* Este botón también abre el menú de pausa */}
        <button className="boton-pausa" onClick={abrirPausa}>
          Pausa
        </button>
      </div>
    </div>
  );
}

export default Juego;