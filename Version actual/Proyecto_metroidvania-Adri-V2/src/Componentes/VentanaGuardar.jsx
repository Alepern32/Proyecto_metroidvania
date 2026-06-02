function VentanaGuardar({ guardarYSalir, salirSinGuardar, cancelar }) {
  return (
    <div className="fondo-ventana">
      <div className="ventana-guardar">
        <h2>¿Quieres guardar la partida?</h2>
        <p>No has guardado la partida actual.</p>

        <div className="cadenas">
          <div className="cadena"></div>
          <div className="cadena"></div>
        </div>

        <div className="botones-guardar">
          <button onClick={guardarYSalir}>Guardar y salir</button>
          <button onClick={salirSinGuardar}>Salir sin guardar</button>
          <button onClick={cancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default VentanaGuardar;