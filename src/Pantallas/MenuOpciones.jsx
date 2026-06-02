function MenuOpciones({
  volverMenu,
  volumenMusica,
  setVolumenMusica,
  volumenEfectos,
  setVolumenEfectos,
  brillo,
  setBrillo,
  dificultad,
  setDificultad
}) {
  return (
    <div className="pantalla-opciones">
      <div className="caja-opciones">
        <h1 className="titulo-opciones">Opciones</h1>

        <div className="grupo-opciones">
          <label>Música</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volumenMusica * 100}
            onChange={(e) => setVolumenMusica(Number(e.target.value) / 100)}
          />
        </div>

        <div className="grupo-opciones">
          <label>Efectos de sonido</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volumenEfectos * 100}
            onChange={(e) => setVolumenEfectos(Number(e.target.value) / 100)}
          />
        </div>

        <div className="grupo-opciones">
          <label>Brillo</label>
          <input
            type="range"
            min="0"
            max="100"
            value={brillo * 100}
            onChange={(e) => setBrillo(Number(e.target.value) / 100)}
          />
        </div>

        <div className="grupo-opciones">
          <label>Dificultad</label>
          <select
            value={dificultad}
            onChange={(e) => setDificultad(e.target.value)}
          >
            <option value="facil">Fácil</option>
            <option value="normal">Normal</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>

        <button onClick={volverMenu}>Volver al menú</button>
      </div>
    </div>
  );
}

export default MenuOpciones;