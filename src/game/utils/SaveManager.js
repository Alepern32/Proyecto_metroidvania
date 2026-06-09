// ── SaveManager.js – Guardado Persistente Mejorado ───────────────────────────
// Guarda partida en localStorage incluyendo habilidades, nivel, posición y oro.

const SAVE_KEY = 'partidaGuardada';

export const SaveManager = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[SaveManager] Error al cargar partida:', e);
      return null;
    }
  },

  save(player, score) {
    try {
      const estado = {
        vida: player.hp,
        vidaMax: player.hpMax,
        oro: score,
        nivel: player.nivel,
        xp: player.xp,
        danioBase: player.danioBase,
        defensa: player.defensa,
        posicionX: Math.round(player.x),
        posicionY: Math.round(player.y),
        habilidades: {
          dobleSalto: player.canDoubleJump ?? false,
          dash: player.canDash ?? false,
        },
        timestamp: Date.now(),
        version: 2,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(estado));
      console.log('✅ Partida guardada:', estado);
      return true;
    } catch (e) {
      console.error('[SaveManager] Error al guardar:', e);
      return false;
    }
  },

  delete() {
    localStorage.removeItem(SAVE_KEY);
    console.log('🗑 Partida eliminada.');
  },

  exists() {
    return localStorage.getItem(SAVE_KEY) !== null;
  },
};
