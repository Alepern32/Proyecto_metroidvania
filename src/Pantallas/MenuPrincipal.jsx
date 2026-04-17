import logoMenu from "../Imagenes/logoMenu.png";
import murcielago1 from "../Imagenes/murcielago1.png";
import murcielago2 from "../Imagenes/murcielago2.png";
import murcielago3 from "../Imagenes/murcielago3.png";
import antorcha from "../Imagenes/antorcha.png";
import llama from "../Imagenes/llama.png";

function MenuPrincipal({ empezarJuego, continuarJuego, abrirOpciones, salirJuego }) {
  return (
    <div className="menu-principal">
      <img
        src={murcielago1}
        alt="Murciélago 1"
        className="murcielago murcielago1"
      />

      <img
        src={murcielago2}
        alt="Murciélago 2"
        className="murcielago murcielago2"
      />

      <img
        src={murcielago3}
        alt="Murciélago 3"
        className="murcielago murcielago3"
      />

      <img
        src={antorcha}
        alt="Antorcha izquierda"
        className="antorcha antorcha-izquierda"
      />

      <img
        src={llama}
        alt="Llama izquierda"
        className="llama llama-izquierda"
      />

      <img
        src={antorcha}
        alt="Antorcha derecha"
        className="antorcha antorcha-derecha"
      />

      <img
        src={llama}
        alt="Llama derecha"
        className="llama llama-derecha"
      />

      <div className="contenido-menu">
        <img
          src={logoMenu}
          alt="Logo Shadow Knight"
          className="logo-menu"
        />

        <div className="contenedor-botones">
          <button onClick={empezarJuego}>Empezar partida</button>
          <button onClick={continuarJuego}>Continuar</button>
          <button onClick={abrirOpciones}>Opciones</button>
          <button onClick={salirJuego}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export default MenuPrincipal;