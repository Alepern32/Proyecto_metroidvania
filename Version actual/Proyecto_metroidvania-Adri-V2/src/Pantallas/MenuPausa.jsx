import cadena from "../Imagenes/cadena.png";

function MenuPausa({
  continuarJuego,
  guardarPartida,
  salirMenuPrincipal
}) {
  return (
    <div className="menu-pausa">
      <div className="panel-pausa">
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

      

        <div className="contenedor-botones-pausa">
          <button onClick={continuarJuego}>Reanudar</button>
          <button onClick={guardarPartida}>Guardar partida</button>
          <button onClick={salirMenuPrincipal}>Salir al menú principal</button>
        </div>
      </div>
    </div>
  );
}

export default MenuPausa;