function MenuOpciones({ volverMenu }) {
  return (
    <div className="pantalla-opciones">
      <div className="caja-opciones">
        <h1 className="titulo-opciones">Opciones</h1>

        <div className="grupo-opciones">
          <label>Música</label>
          <input type="range" min="0" max="100" defaultValue="70" />
        </div>

        <div className="grupo-opciones">
          <label>Efectos de sonido</label>
          <input type="range" min="0" max="100" defaultValue="80" />
        </div>

        <div className="grupo-opciones">
          <label>Brillo</label>
          <input type="range" min="0" max="100" defaultValue="50" />
        </div>

        <div className="grupo-opciones">
          <label>Dificultad</label>
          <select>
            <option>Fácil</option>
            <option>Normal</option>
            <option>Difícil</option>
          </select>
        </div>

        <button onClick={volverMenu}>Volver al menú</button>
      </div>
    </div>
  );
}

export default MenuOpciones;