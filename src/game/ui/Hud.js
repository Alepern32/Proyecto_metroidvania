// ── HUD: barras de HP/XP, puntuación y nivel ─────────────────────────────

export default class Hud {
  constructor(scene, player, score, HX = 120) {
    this.scene = scene;
    this.player = player;

    // ── Monedas ───────────────────────────────────────────────────────────
    this.scoreText = scene.add
      .text(HX - 8, 120, "🪙 " + score, {
        fontSize: "16px",
        fill: "#ffd700",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // ── Icono de corazón ──────────────────────────────────────────────────
    scene.add
      .text(HX - 2, 68, "❤", {
        fontSize: "14px",
        fill: "#ff6666",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // ── Barra de HP ───────────────────────────────────────────────────────
    this.hpBarBg = scene.add
      .rectangle(HX + 20, 75, 160, 8, 0x330000)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.hpBar = scene.add
      .rectangle(HX + 20, 75, 160, 8, 0x44ff44)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.hpValText = scene.add
      .text(HX + 185, 65, "", {
        fontSize: "12px",
        fill: "#ffffff",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // ── Icono de estrella ─────────────────────────────────────────────────
    scene.add
      .text(HX - 5, 90, "⭐", {
        fontSize: "14px",
        fill: "#aaffaa",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // ── Barra de XP ───────────────────────────────────────────────────────
    this.xpBarBg = scene.add
      .rectangle(HX + 20, 100, 160, 8, 0x002200)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.xpBar = scene.add
      .rectangle(HX + 20, 100, 160, 8, 0x00cc44)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.xpValText = scene.add
      .text(HX + 185, 92, "", {
        fontSize: "12px",
        fill: "#aaffaa",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // ── Nivel ─────────────────────────────────────────────────────────────
    this.levelText = scene.add
      .text(HX - 3, 150, "Nv.1", {
        fontSize: "16px",
        fill: "#ffffff",
        stroke: "#000",
        strokeThickness: 3,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  // ── HUD: barra de HP ─────────────────────────────────────────────────────
  updateHpBar() {
    const p = this.player;
    const pct = Math.max(0, p.hp / p.hpMax);
    this.hpBar.width = 160 * pct;
    this.hpBar.setFillStyle(
      pct > 0.6 ? 0x44ff44 : pct > 0.3 ? 0xffaa00 : 0xff2222,
    );
    this.hpValText.setText(Math.ceil(p.hp) + "/" + p.hpMax);
  }

  // ── HUD: barra de XP ─────────────────────────────────────────────────────
  updateXpBar() {
    const p = this.player;
    const pct = Math.min(1, p.xp / p.xpSiguienteNivel);
    this.xpBar.width = 150 * pct;
    this.xpValText.setText(p.xp + "/" + p.xpSiguienteNivel);
    this.levelText.setText("Nv." + p.nivel);
  }

  setScore(score) {
    this.scoreText.setText("🪙 " + score);
  }

  // ── Iconos de habilidades desbloqueadas ───────────────────────────────────
  activarDobleSalto() {
    if (this._iconDobleSalto) return;
    this._iconDobleSalto = this.scene.add
      .text(this.scoreText.x, 175, "⬆x2", {
        fontSize: "13px",
        fill: "#00ffaa",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  activarDash() {
    if (this._iconDash) return;
    const x = this._iconDobleSalto ? this._iconDobleSalto.x + 55 : this.scoreText.x;
    this._iconDash = this.scene.add
      .text(x, 175, "💨Dash", {
        fontSize: "13px",
        fill: "#4488ff",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  // ── Toast de notificación ────────────────────────────────────────────────
  mostrarToast(mensaje, color = 0xffffff) {
    const { width } = this.scene.scale;
    const toast = this.scene.add
      .text(width / 2, 50, mensaje, {
        fontSize: "15px",
        fill: "#" + color.toString(16).padStart(6, "0"),
        stroke: "#000",
        strokeThickness: 3,
        backgroundColor: "#00000088",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(200)
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: toast,
      y: 30,
      alpha: 0,
      duration: 1800,
      delay: 600,
      onComplete: () => toast.destroy(),
    });
  }
}