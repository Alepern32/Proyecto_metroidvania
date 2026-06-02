import { useState } from "react";
import "./App.css";
import VentanaGuardar from "./Componentes/VentanaGuardar";
import Juego from "./Pantallas/Juego";
import MenuOpciones from "./Pantallas/MenuOpciones";
import MenuPausa from "./Pantallas/MenuPausa";
import MenuPrincipal from "./Pantallas/MenuPrincipal";
import PantallaInicio from "./Pantallas/PantallaInicio";

function App() {
  const [pantallaActual, setPantallaActual] = useState("inicio");
  const [mostrarPausa, setMostrarPausa] = useState(false);
  const [mostrarVentanaGuardar, setMostrarVentanaGuardar] = useState(false);
  const [partidaGuardada, setPartidaGuardada] = useState(false);

  // 🎮 Opciones del juego
  const [volumenMusica, setVolumenMusica] = useState(0.7);
  const [volumenEfectos, setVolumenEfectos] = useState(0.8);
  const [brillo, setBrillo] = useState(0.5);
  const [dificultad, setDificultad] = useState("facil");

  function guardarPartida() {
    window.dispatchEvent(new Event("guardarPartida"));
    setTimeout(() => {
      const guardado = localStorage.getItem("partidaGuardada");
      if (guardado) {
        setPartidaGuardada(true);
        alert("Partida guardada ✅");
      } else {
        alert("No se pudo guardar la partida");
      }
    }, 100);
  }

  function continuarPartida() {
    const raw = localStorage.getItem("partidaGuardada");
    if (raw) {
      setPantallaActual("juego");
    } else {
      alert("No hay ninguna partida guardada");
    }
  }

  function empezarJuego() {
    setPartidaGuardada(false);
    setPantallaActual("juego");
  }

  function continuarJuego() {
    setMostrarPausa(false);
  }

  function abrirOpciones() {
    setPantallaActual("opciones");
  }

  function salirJuego() {
    alert("Salir del juego");
  }

  function salirMenuPrincipal() {
    if (partidaGuardada) {
      setPantallaActual("menu");
      setMostrarPausa(false);
    } else {
      setMostrarVentanaGuardar(true);
    }
  }

  function guardarYSalir() {
    window.dispatchEvent(new Event("guardarPartida"));
    setTimeout(() => {
      setPartidaGuardada(true);
      setMostrarVentanaGuardar(false);
      setMostrarPausa(false);
      setPantallaActual("menu");
    }, 100);
  }

  function salirSinGuardar() {
    setMostrarVentanaGuardar(false);
    setMostrarPausa(false);
    setPantallaActual("menu");
  }

  function cancelarSalida() {
    setMostrarVentanaGuardar(false);
  }

  return (
    // 🌟 AQUÍ está el brillo aplicado a TODO el juego
    <div style={{ filter: `brightness(${0.5 + brillo})` }}>

      {pantallaActual === "inicio" && (
        <PantallaInicio cambiarPantalla={setPantallaActual} />
      )}

      {pantallaActual === "menu" && (
        <MenuPrincipal
          empezarJuego={empezarJuego}
          continuarJuego={continuarPartida}
          abrirOpciones={abrirOpciones}
          salirJuego={salirJuego}
          volumenMusica={volumenMusica}
          volumenEfectos={volumenEfectos}
        />
      )}

      {pantallaActual === "opciones" && (
        <MenuOpciones
          volverMenu={() => setPantallaActual("menu")}
          volumenMusica={volumenMusica}
          setVolumenMusica={setVolumenMusica}
          volumenEfectos={volumenEfectos}
          setVolumenEfectos={setVolumenEfectos}
          brillo={brillo}
          setBrillo={setBrillo}
          dificultad={dificultad}
          setDificultad={setDificultad}
        />
      )}

      {pantallaActual === "juego" && (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          <Juego abrirPausa={() => setMostrarPausa(true)} />

          {mostrarPausa && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 200
              }}
            >
              <MenuPausa
                continuarJuego={continuarJuego}
                guardarPartida={guardarPartida}
                salirMenuPrincipal={salirMenuPrincipal}
              />
            </div>
          )}

          {mostrarVentanaGuardar && (
            <VentanaGuardar
              guardarYSalir={guardarYSalir}
              salirSinGuardar={salirSinGuardar}
              cancelar={cancelarSalida}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;