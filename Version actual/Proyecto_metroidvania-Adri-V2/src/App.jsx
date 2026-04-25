import { useState } from "react";
import "./App.css";
import PantallaInicio from "./Pantallas/PantallaInicio";
import MenuPrincipal from "./Pantallas/MenuPrincipal";
import MenuPausa from "./Pantallas/MenuPausa";
import Juego from "./Pantallas/Juego";
import VentanaGuardar from "./Componentes/VentanaGuardar";
import MenuOpciones from "./Pantallas/MenuOpciones";

function App() {
  const [pantallaActual, setPantallaActual] = useState("inicio");
  const [mostrarPausa, setMostrarPausa] = useState(false);
  const [mostrarVentanaGuardar, setMostrarVentanaGuardar] = useState(false);
  const [partidaGuardada, setPartidaGuardada] = useState(false);

  function empezarJuego() {
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

  function guardarPartida() {
    setPartidaGuardada(true);
    alert("Partida guardada");
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
    setPartidaGuardada(true);
    setMostrarVentanaGuardar(false);
    setMostrarPausa(false);
    setPantallaActual("menu");
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
    <div>
      {pantallaActual === "inicio" && (
        <PantallaInicio cambiarPantalla={setPantallaActual} />
      )}

      {pantallaActual === "menu" && (
        <MenuPrincipal
          empezarJuego={empezarJuego}
          continuarJuego={empezarJuego}
          abrirOpciones={abrirOpciones}
          salirJuego={salirJuego}
        />
      )}

      {pantallaActual === "opciones" && (
        <MenuOpciones volverMenu={() => setPantallaActual("menu")} />
      )}

      {/* El juego NUNCA se desmonta mientras pantallaActual === "juego" */}
      {pantallaActual === "juego" && (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>

          {/* Phaser siempre montado, recibe si está pausado */}
          <Juego
            abrirPausa={() => setMostrarPausa(true)}
            paused={mostrarPausa}
          />

          {/* Pausa se superpone encima sin desmontar Juego */}
          {mostrarPausa && (
            <div style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              zIndex: 200
            }}>
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