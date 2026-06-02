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
  const [esNuevaPartida, setEsNuevaPartida] = useState(false);

  // ── Guardar: lanza evento que MainScene escucha y guarda en localStorage ──
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

  // ── Cargar: lee localStorage y va directo al juego ────────────────────────
  function continuarPartida() {
    const raw = localStorage.getItem("partidaGuardada");
    if (raw) {
      setEsNuevaPartida(false);
      setPantallaActual("juego");
    } else {
      alert("No hay ninguna partida guardada");
    }
  }

  // ── Nueva partida: borra el guardado opcionalmente? No, simplemente arranca desde cero ──
  function empezarJuego() {
    setPartidaGuardada(false);
    setEsNuevaPartida(true);
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

  // ── AHORA SIEMPRE PREGUNTA ANTES DE SALIR AL MENÚ PRINCIPAL ───────────────
  function salirMenuPrincipal() {
    setMostrarPausa(false);          // cierra el menú de pausa
    setMostrarVentanaGuardar(true);  // muestra la ventana de pregunta
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
    <div>
      {pantallaActual === "inicio" && (
        <PantallaInicio cambiarPantalla={setPantallaActual} />
      )}

      {pantallaActual === "menu" && (
        <MenuPrincipal
          empezarJuego={empezarJuego}
          continuarJuego={continuarPartida}
          abrirOpciones={abrirOpciones}
          salirJuego={salirJuego}
        />
      )}

      {pantallaActual === "opciones" && (
        <MenuOpciones volverMenu={() => setPantallaActual("menu")} />
      )}

      {pantallaActual === "juego" && (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          <Juego
            abrirPausa={() => setMostrarPausa(true)}
            esNuevaPartida={esNuevaPartida}
            juegoPausado={mostrarPausa}
          />

          {mostrarPausa && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 200,
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