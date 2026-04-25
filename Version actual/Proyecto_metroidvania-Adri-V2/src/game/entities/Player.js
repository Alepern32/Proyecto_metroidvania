export default class Player {

  constructor(scene, x, y, jData) {
    this.scene = scene;
    this.nivelesData = jData?.niveles || [];

    this.sprite = scene.physics.add.sprite(x, y, "knight-idle");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(25, 33);
    this.sprite.body.setOffset(36, 29);

    this.sprite.hpMax            = jData?.vida    || 75;
    this.sprite.hp               = this.sprite.hpMax;
    this.sprite.danioBase        = jData?.danio   || 5;
    this.sprite.defensa          = jData?.defensa || 1;
    this.sprite.xp               = jData?.xp      || 0;
    this.sprite.nivel            = jData?.nivel    || 1;
    this.sprite.xpSiguienteNivel = this.xpParaNivel(this.sprite.nivel + 1);

    this.sprite.invincible  = false;
    this.sprite.isDead      = false;
    this.sprite.isAttacking = false;
  }

  xpParaNivel(nivel) {
    const entrada = this.nivelesData.find(n => n.nivel === nivel);
    return entrada?.xp_req ?? 99999;
  }

  subirNivel() {
    const sprite = this.sprite;
    const nivelAnterior = sprite.nivel;

    sprite.nivel += 1;
    sprite.xp = 0;
    sprite.xpSiguienteNivel = this.xpParaNivel(sprite.nivel + 1);

    const bonus = this.nivelesData.find(n => n.nivel === sprite.nivel);
    if (bonus) {
      sprite.hpMax     += bonus.vida_bonus  || 0;
      sprite.danioBase += bonus.danio_bonus || 0;
      if (bonus.defensa != null) sprite.defensa = bonus.defensa;
    }
    sprite.hp = sprite.hpMax;

    return nivelAnterior !== sprite.nivel;
  }

  hit(enemy) {
    const sprite = this.sprite;
    const scene  = this.scene;

    if (sprite.invincible || sprite.isDead) return;

    const danoBase  = enemy.danioAtaque || 5;
    const reduccion = Math.floor(sprite.defensa * 0.5);
    const danoFinal = Math.max(1, danoBase - reduccion);

    sprite.hp = Math.max(0, sprite.hp - danoFinal);

    scene.spawnDamageText(sprite.x, sprite.y - 30, danoFinal, "#ff4455");
    scene.updateHpBar();

    if (sprite.hp <= 0) {
      sprite.isDead = true;
      sprite.play("knight-death", true);
      return;
    }

    sprite.invincible = true;
    sprite.play("knight-hurt", true);
    sprite.setVelocity((sprite.x > enemy.x ? 1 : -1) * 250, -180);

    scene.tweens.add({
      targets: sprite,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        sprite.alpha = 1;
        sprite.invincible = false;
      }
    });
  }
}