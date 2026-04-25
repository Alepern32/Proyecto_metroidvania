import { useState } from "react";
import "./App.css";
import PantallaInicio from "./Pantallas/PantallaInicio";
import MenuPrincipal from "./Pantallas/MenuPrincipal";
import MenuPausa from "./Pantallas/MenuPausa";
import Juego from "./Pantallas/Juego";
import VentanaGuardar from "./Componentes/VentanaGuardar";
import MenuOpciones from "./Pantallas/MenuOpciones";

function App() {
  // Estos son los datos con los que empieza una partida nueva
  const datosIniciales = {
    vida: 100,
    oro: 0,
    nivel: 1,
    posicionX: 0,
    posicionY: 0,
  };

  // Aquí controlo en qué pantalla está el juego
  const [pantallaActual, setPantallaActual] = useState("inicio");

  // Esto sirve para mostrar u ocultar el menú de pausa
  const [mostrarPausa, setMostrarPausa] = useState(false);

  // Esto sirve para mostrar la ventana de guardar antes de salir
  const [mostrarVentanaGuardar, setMostrarVentanaGuardar] = useState(false);

  // Esto me ayuda a saber si ya se guardó la partida
  const [partidaGuardada, setPartidaGuardada] = useState(false);

  // Aquí guardo los datos actuales del jugador
  const [datosJugador, setDatosJugador] = useState(datosIniciales);

  function empezarJuego() {
    // Cuando empieza una partida nueva, pongo los datos iniciales
    setDatosJugador(datosIniciales);
    setPartidaGuardada(false);
    setPantallaActual("juego");
  }

  function continuarPartida() {
    // Busco si hay una partida guardada en el navegador
    const partida = localStorage.getItem("partidaGuardada");

    if (partida) {
      // Si existe, convierto el texto guardado otra vez en datos
      setDatosJugador(JSON.parse(partida));
      setPartidaGuardada(true);
      setPantallaActual("juego");
    } else {
      alert("No hay ninguna partida guardada");
    }
  }

  function continuarJuego() {
    // Cierra el menú de pausa y vuelve al juego
    setMostrarPausa(false);
  }

  function abrirOpciones() {
    // Cambia del menú principal a la pantalla de opciones
    setPantallaActual("opciones");
  }

  function salirJuego() {
    // De momento solo muestra un aviso porque no cerramos el navegador desde React
    alert("Salir del juego");
  }

  function guardarPartida() {
    // Guardo los datos actuales del jugador en el navegador
    localStorage.setItem("partidaGuardada", JSON.stringify(datosJugador));
    setPartidaGuardada(true);
    alert("Partida guardada");
  }

  function salirMenuPrincipal() {
    // Si ya se guardó, puede volver al menú directamente
    if (partidaGuardada) {
      setPantallaActual("menu");
      setMostrarPausa(false);
    } else {
      // Si no se guardó, pregunto si quiere guardar antes de salir
      setMostrarVentanaGuardar(true);
    }
  }

  function guardarYSalir() {
    // Guarda la partida y después vuelve al menú principal
    localStorage.setItem("partidaGuardada", JSON.stringify(datosJugador));
    setPartidaGuardada(true);
    setMostrarVentanaGuardar(false);
    setMostrarPausa(false);
    setPantallaActual("menu");
  }

  function salirSinGuardar() {
    // Sale al menú principal sin guardar los cambios
    setMostrarVentanaGuardar(false);
    setMostrarPausa(false);
    setPantallaActual("menu");
  }

  function cancelarSalida() {
    // Cierra la ventana y se queda en el juego
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
        <div>
          <Juego
            abrirPausa={() => setMostrarPausa(true)}
            datosJugador={datosJugador}
          />

          {mostrarPausa && (
            <MenuPausa
              continuarJuego={continuarJuego}
              guardarPartida={guardarPartida}
              salirMenuPrincipal={salirMenuPrincipal}
            />
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