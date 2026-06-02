function Hud({ vida, oro }) {
  return (
    <div className="hud">
      <div className="vida-personaje">
        ❤️ Vida: {vida}
      </div>

      <div className="oro-personaje">
        🪙 Oro: {oro}
      </div>
    </div>
  );
}

export default Hud;