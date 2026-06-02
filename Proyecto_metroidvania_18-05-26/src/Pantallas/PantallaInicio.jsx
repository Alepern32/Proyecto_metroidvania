import { useEffect } from "react";
import logoJuego from "../Imagenes/logoShadowKnight.jpeg";

function PantallaInicio({ cambiarPantalla }) {
  useEffect(() => {
    const tiempo = setTimeout(() => {
      cambiarPantalla("menu");
    }, 4000);

    return () => clearTimeout(tiempo);
  }, [cambiarPantalla]);

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