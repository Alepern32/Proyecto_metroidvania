import { useState, useEffect } from "react";
import logoJuego from "../Imagenes/logoShadowKnight.jpeg";
import sonidoSplash from "../sonidos/splash.mp3";

function PantallaInicio({ cambiarPantalla }) {
  const [iniciado, setIniciado] = useState(false);

  useEffect(() => {
    if (!iniciado) return;

    const audio = new Audio(sonidoSplash);
    audio.volume = 0.5;
    audio.playbackRate = 0.85;

    audio.play();

    const tiempo = setTimeout(() => {
      cambiarPantalla("menu");
    }, 4000);

    return () => {
      clearTimeout(tiempo);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [iniciado, cambiarPantalla]);

  if (!iniciado) {
    return (
      <div className="pantalla-inicio" onClick={() => setIniciado(true)}>
        <p className="texto-inicio">Haz clic para comenzar</p>
      </div>
    );
  }

  return (
    <div className="pantalla-inicio">
      <img
        src={logoJuego}
        alt="Logo Shadow Knight"
        className="logo-juego"
      />
    </div>
  );
}

export default PantallaInicio;