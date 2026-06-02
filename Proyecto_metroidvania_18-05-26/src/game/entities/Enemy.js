export default class Enemy {

  // ── Crea y configura un enemigo en la escena ──────────────────────────────
  static spawn(scene, x, eData) {
    if (!eData) return null;

    const nombre = eData.nombre;

    const texKey = "enemy-" + nombre.replace(/ /g, "_");
    const texValida = scene.textures.exists(texKey) && scene.textures.get(texKey).frameTotal > 1;
    const textureKey = texValida ? texKey : "enemy-slime";
    const fallback = textureKey === "enemy-slime";

    const enemy = scene.enemies.create(x, 800, textureKey);
    if (!enemy) return null;

    enemy.setCollideWorldBounds(true);

    // ── Hitbox según tipo + checkCollision.up = false para saltar bajo plataformas ──
    if (nombre === "slime") {
      enemy.body.setSize(20, 14);
      enemy.body.setOffset(6, 0);
    } else if (nombre === "murcielago") {
      enemy.body.setSize(24, 16);
      enemy.body.setOffset(4, 8);
      enemy.body.allowGravity = false;
      // El murciélago vuela, no necesita checkCollision.up
    } else if (nombre === "planta saltarina") {
      enemy.body.setSize(20, 28);
      enemy.body.setOffset(6, 4);
    } else {
      enemy.body.setSize(20, 20);
    }

    // ── Stats leídos del JSON de enemigos ────────────────────────────────
    enemy.tipo        = nombre;
    enemy.hp          = eData.estadisticas?.vida       || 20;
    enemy.hpMax       = enemy.hp;
    enemy.danioAtaque = eData.estadisticas?.danio      || 5;
    enemy.defensa     = eData.estadisticas?.defensa    || 1;
    enemy.velocidad   = eData.estadisticas?.velocidad  || 60;
    enemy.xpReward    = eData.estadisticas?.experiencia || 10;
    enemy.moneyDrop   = eData.drop?.dinero             || 5;
    enemy.dropProb    = eData.drop?.probabilidad       ?? 1;

    enemy.dir         = Math.random() > 0.5 ? 1 : -1;
    enemy.patrolTimer = 0;
    enemy.jumpTimer   = 0;
    enemy.chaseDist   = nombre === "murcielago" ? 250 : 180;

    // ── Barra de vida flotante ───────────────────────────────────────────
    const BAR_W = 30, BAR_H = 4, BAR_OFF_Y = -22;
    const bg   = scene.add.rectangle(0, 0, BAR_W + 2, BAR_H + 2, 0x000000, 0.7).setDepth(49);
    const fill = scene.add.rectangle(0, 0, BAR_W, BAR_H, 0x44ff44).setOrigin(0, 0.5).setDepth(50);

    enemy.updateHpBar = () => {
      if (!enemy.active) return;
      const pct = Math.max(0, enemy.hp / enemy.hpMax);
      fill.width = BAR_W * pct;
      fill.setFillStyle(pct > 0.6 ? 0x44ff44 : pct > 0.3 ? 0xffaa00 : 0xff2222);
      bg.setPosition(enemy.x, enemy.y + BAR_OFF_Y);
      fill.setPosition(enemy.x - BAR_W / 2, enemy.y + BAR_OFF_Y);
    };

    const origDestroy = enemy.destroy.bind(enemy);
    enemy.destroy = () => {
      bg.destroy();
      fill.destroy();
      origDestroy();
    };

    if (fallback) enemy.tipo = "slime";
    const animKey = fallback ? "slime-move" : Enemy.animMove(nombre);
    if (scene.anims.exists(animKey)) enemy.play(animKey);

    return enemy;
  }

  static animMove(nombre) {
    if (nombre === "slime")            return "slime-move";
    if (nombre === "murcielago")       return "bat-fly";
    if (nombre === "planta saltarina") return "plant-move";
    return "slime-move";
  }

  static animHurt(nombre) {
    if (nombre === "slime")            return "slime-hurt";
    if (nombre === "murcielago")       return "bat-hurt";
    if (nombre === "planta saltarina") return "plant-hurt";
    return "slime-hurt";
  }

  static updateAI(enemy, player, delta) {
    if (!enemy.active) return;

    const dx = Math.abs(enemy.x - player.x);
    const dy = Math.abs(enemy.y - player.y);

    if (enemy.tipo === "slime") {
      if (dy < 40 && dx < enemy.chaseDist) {
        const dir = player.x > enemy.x ? 1 : -1;
        enemy.setVelocityX(enemy.velocidad * dir);
        enemy.setFlipX(dir > 0);
      } else {
        enemy.patrolTimer += delta;
        if (enemy.patrolTimer > 2000) { enemy.dir *= -1; enemy.patrolTimer = 0; }
        enemy.setVelocityX(enemy.velocidad * 0.4 * enemy.dir);
        enemy.setFlipX(enemy.dir > 0);
      }

    } else if (enemy.tipo === "murcielago") {
      if (dx < enemy.chaseDist) {
        const dirX = player.x > enemy.x ? 1 : -1;
        const dirY = player.y > enemy.y ? 1 : -1;
        enemy.setVelocityX(enemy.velocidad * dirX);
        enemy.setVelocityY(enemy.velocidad * 0.6 * dirY);
        enemy.setFlipX(dirX > 0);
      } else {
        enemy.patrolTimer += delta;
        if (enemy.patrolTimer > 1500) { enemy.dir *= -1; enemy.patrolTimer = 0; }
        enemy.setVelocityX(enemy.velocidad * 0.3 * enemy.dir);
        enemy.setVelocityY(Math.sin(enemy.patrolTimer * 0.002) * 30);
      }

    } else if (enemy.tipo === "planta saltarina") {
      enemy.jumpTimer += delta;
      const onGround = enemy.body.blocked.down;

      if (dx < enemy.chaseDist) {
        const dir = player.x > enemy.x ? 1 : -1;
        enemy.setVelocityX(enemy.velocidad * 0.5 * dir);
        enemy.setFlipX(dir > 0);
        if (onGround && enemy.jumpTimer > 1200) { enemy.setVelocityY(-500); enemy.jumpTimer = 0; }
      } else {
        enemy.patrolTimer += delta;
        if (enemy.patrolTimer > 2500) { enemy.dir *= -1; enemy.patrolTimer = 0; }
        enemy.setVelocityX(enemy.velocidad * 0.3 * enemy.dir);
        if (onGround && enemy.jumpTimer > 2000) { enemy.setVelocityY(-380); enemy.jumpTimer = 0; }
      }
    }
  }
}