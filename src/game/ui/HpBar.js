// ── Barra de vida flotante reutilizable ───────────────────────────────────

export default class HpBar {
  constructor(scene, { width = 30, height = 4, offsetY = -22 } = {}) {
    this.BAR_W = width;
    this.BAR_H = height;
    this.BAR_OFF_Y = offsetY;

    this.bg = scene.add
      .rectangle(0, 0, this.BAR_W + 2, this.BAR_H + 2, 0x000000, 0.7)
      .setDepth(49);
    this.fill = scene.add
      .rectangle(0, 0, this.BAR_W, this.BAR_H, 0x44ff44)
      .setOrigin(0, 0.5)
      .setDepth(50);
  }

  update(x, y, pct) {
    this.fill.width = this.BAR_W * pct;
    this.fill.setFillStyle(
      pct > 0.6 ? 0x44ff44 : pct > 0.3 ? 0xffaa00 : 0xff2222
    );
    this.bg.setPosition(x, y + this.BAR_OFF_Y);
    this.fill.setPosition(x - this.BAR_W / 2, y + this.BAR_OFF_Y);
  }

  destroy() {
    this.bg.destroy();
    this.fill.destroy();
  }
}
