function VentanaGuardar({ guardarYSalir, salirSinGuardar, cancelar }) {
  return (
    <div className="fondo-ventana">
      <div className="ventana-guardar">
        {/* Mensaje que aparece cuando el jugador quiere salir sin guardar */}
        <h2>¿Quieres guardar la partida?</h2>
        <p>No has guardado la partida actual.</p>

        {/* Decoración de cadenas para mantener el estilo del juego */}
        <div className="cadenas">
          <div className="cadena"></div>
          <div className="cadena"></div>
        </div>

        {/* Botones para decidir qué hacer antes de volver al menú */}
        <div className="botones-guardar">
          {/* Guarda la partida y vuelve al menú principal */}
          <button onClick={guardarYSalir}>Guardar y salir</button>

          {/* Sale al menú sin guardar los cambios */}
          <button onClick={salirSinGuardar}>Salir sin guardar</button>

          {/* Cierra esta ventana y vuelve al juego */}
          <button onClick={cancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default VentanaGuardar;
