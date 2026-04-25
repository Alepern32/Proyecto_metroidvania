import cadena from "../Imagenes/cadena.png";

function MenuPausa({
  continuarJuego,
  guardarPartida,
  salirMenuPrincipal
}) {
  return (
    <div className="menu-pausa">
      <div className="panel-pausa">
        {/* Estas imágenes son decorativas para el panel de pausa */}
        <div className="cadenas">
          <img
            src={cadena}
            alt="Cadena izquierda"
            className="imagen-cadena"
          />
          <img
            src={cadena}
            alt="Cadena derecha"
            className="imagen-cadena"
          />
        </div>

        {/* Botones del menú de pausa */}
        <div className="contenedor-botones-pausa">
          {/* Este botón reanuda la partida */}
          <button onClick={continuarJuego}>Reanudar</button>

          {/* Este botón guarda los datos actuales del jugador */}
          <button onClick={guardarPartida}>Guardar partida</button>

          {/* Este botón vuelve al menú principal (puede pedir guardar antes) */}
          <button onClick={salirMenuPrincipal}>
            Salir al menú principal
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuPausa;