/// <reference path="phaser.d.ts" />

class Main extends Phaser.Scene {
  preload() {
    // Spritesheets del caballero
    this.load.spritesheet("knight-idle", "assets/Caballero/IDLE.png", {
      frameWidth: 96,
      frameHeight: 84,
    });
    this.load.spritesheet("knight-run", "assets/Caballero/RUN.png", {
      frameWidth: 96,
      frameHeight: 84,
    });
    this.load.spritesheet("knight-attack", "assets/Caballero/ATTACK_1.png", {
      frameWidth: 96,
      frameHeight: 84,
    });
    this.load.spritesheet("knight-jump", "assets/Caballero/JUMP.png", {
      frameWidth: 96,
      frameHeight: 84,
    });
    this.load.spritesheet("knight-hurt", "assets/Caballero/HURT.png", {
      frameWidth: 96,
      frameHeight: 84,
    });
    this.load.spritesheet("knight-death", "assets/Caballero/DEATH.png", {
      frameWidth: 96,
      frameHeight: 84,
    });

    // Slime enemigo
    this.load.spritesheet("slime", "assets/Enemigos/Slime_Green.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Moneda
    this.load.spritesheet("coin", "assets/coin.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.json("coinsData", "coins.json");
  }

  create() {
    // Foco del canvas para capturar teclado
    this.game.canvas.setAttribute("tabindex", "0");
    this.game.canvas.focus();
    this.input.on("pointerdown", () => this.game.canvas.focus());

    // ── Texturas procedurales (deben ir en create, no en preload)
    const groundGfx = this.make.graphics({ add: false });
    groundGfx.fillStyle(0x4caf50, 1);
    groundGfx.fillRect(0, 0, 800, 50);
    groundGfx.generateTexture("ground", 800, 50);
    groundGfx.destroy();

    const elevGfx = this.make.graphics({ add: false });
    elevGfx.fillStyle(0xb8860b, 1);
    elevGfx.fillRect(0, 0, 300, 50);
    elevGfx.generateTexture("elevacion", 300, 50);
    elevGfx.destroy();

    const fbGfx = this.make.graphics({ add: false });
    fbGfx.fillStyle(0xff6600, 1);
    fbGfx.fillCircle(6, 6, 6);
    fbGfx.fillStyle(0xffff00, 1);
    fbGfx.fillCircle(6, 6, 3);
    fbGfx.generateTexture("fireball", 12, 12);
    fbGfx.destroy();

    // ── Plataformas
    // Suelo: altura 50, centro y=475 → ocupa y=450 a y=500 (pegado al fondo)
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 475, "ground");

    // Elevación: altura 50, base pegada al tope del suelo (y=450) → centro y=425
    this.elevation = this.physics.add.staticGroup();
    const elev = this.elevation.create(300, 425, "elevacion");
    elev.refreshBody();

    // ────────────────────────────────
    //  JUGADOR (caballero)
    // frameWidth:96 frameHeight:84
    // Queremos un body de ~28×50, centrado en el sprite
    // offset X = (96-28)/2 = 34, offset Y = 84-50 = 34 (pies al fondo del frame)
    // ────────────────────────────────
    this.player = this.physics.add.sprite(100, 400, "knight-idle");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(25, 33);
    this.player.body.setOffset(36, 29); // ajustado para que pies toquen suelo visualmente
    this.player.hp = 3;
    this.player.invincible = false;
    this.player.isDead = false;
    this.player.isAttacking = false;

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.elevation);

    // ────────────────────────────────
    //  ENEMIGO (slime)
    //  frameWidth:32 frameHeight:32
    //  body: 20×14, offset X=6, offset Y=16 (parte baja del frame)
    // ────────────────────────────────
    this.enemy = this.physics.add.sprite(600, 430, "slime");
    this.enemy.setCollideWorldBounds(true);
    this.enemy.body.setSize(20, 14);
    this.enemy.body.setOffset(6, 16);
    this.enemy.hp = 3;
    this.enemy.state = "patrol";
    this.enemy.dir = -1;
    this.enemy.patrolTimer = 0;
    this.enemy.jumpTimer = 0;
    this.enemy.jumpInterval = 3000;
    this.enemy.chaseDist = 180;

    this.physics.add.collider(this.enemy, this.platforms);
    this.physics.add.collider(this.enemy, this.elevation);

    this.physics.add.overlap(this.player, this.enemy, () => {
      if (!this.player.invincible && this.enemy.active && !this.player.isDead) {
        this.hitPlayer();
      }
    });

    // ────────────────────────────────
    //  BOLAS DE FUEGO
    // ────────────────────────────────
    this.fireballs = this.physics.add.group();

    this.physics.add.overlap(this.fireballs, this.enemy, (fb) => {
      this.destroyFireball(fb);
      this.hitEnemy();
    });
    this.physics.add.collider(this.fireballs, this.platforms, (fb) =>
      this.destroyFireball(fb),
    );
    this.physics.add.collider(this.fireballs, this.elevation, (fb) =>
      this.destroyFireball(fb),
    );

    // Z = ataque espada  |  X = bola de fuego
    this.swordKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z,
    );
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.fireCooldown = false;

    // ────────────────────────────────
    //  ANIMACIONES DEL CABALLERO
    // ────────────────────────────────
    this.anims.create({
      key: "knight-idle",
      frames: this.anims.generateFrameNumbers("knight-idle", {
        start: 0,
        end: 6,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "knight-run",
      frames: this.anims.generateFrameNumbers("knight-run", {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "knight-attack",
      frames: this.anims.generateFrameNumbers("knight-attack", {
        start: 0,
        end: 5,
      }),
      frameRate: 16,
      repeat: 0,
    });
    this.anims.create({
      key: "knight-jump",
      frames: this.anims.generateFrameNumbers("knight-jump", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.anims.create({
      key: "knight-hurt",
      frames: this.anims.generateFrameNumbers("knight-hurt", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.anims.create({
      key: "knight-death",
      frames: this.anims.generateFrameNumbers("knight-death", {
        start: 0,
        end: 11,
      }),
      frameRate: 10,
      repeat: 0,
    });

    // Animaciones del slime
    this.anims.create({
      key: "slime-idle",
      frames: this.anims.generateFrameNumbers("slime", { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "slime-move",
      frames: this.anims.generateFrameNumbers("slime", { start: 20, end: 28 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "slime-hurt",
      frames: this.anims.generateFrameNumbers("slime", { start: 36, end: 39 }),
      frameRate: 10,
      repeat: 0,
    });

    // Moneda
    this.anims.create({
      key: "coin-spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    // ── Monedas desde JSON
    this.coins = this.physics.add.group();
    try {
      const coinsData = this.cache.json.get("coinsData");
      if (coinsData && Array.isArray(coinsData.coins)) {
        coinsData.coins.forEach(({ x, y }) => {
          const c = this.coins.create(x, y, "coin");
          c.body.allowGravity = false;
          c.setImmovable(true);
          c.play("coin-spin");
        });
      }
    } catch (e) {
      console.warn("Sin monedas:", e);
    }

    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
      coin.destroy();
      this.score += 1;
      this.scoreText.setText("Monedas: " + this.score);
    });

    // ── Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // ── HUD
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Monedas: 0", {
      fontSize: "16px",
      fill: "#ffffff",
    });
    this.hpText = this.add.text(16, 36, "HP: ♥♥♥", {
      fontSize: "16px",
      fill: "#ff4444",
    });
    this.enemyHpText = this.add.text(16, 56, "Slime enemigo: ♥♥♥", {
      fontSize: "16px",
      fill: "#44ff88",
    });
    this.add.text(16, 76, "Z: espada  |  X: fuego  |  ↑/Space: saltar", {
      fontSize: "12px",
      fill: "#cccccc",
    });

    // Animación inicial
    this.player.play("knight-idle");
    this.enemy.play("slime-move");
  }

  // ──────────────────────────────────────────
  //  DISPARO
  // ──────────────────────────────────────────
  shootFireball() {
    if (this.fireCooldown || this.player.isDead) return;
    this.fireCooldown = true;

    const dir = this.player.flipX ? -1 : 1;
    const fb = this.fireballs.create(
      this.player.x + dir * 20,
      this.player.y - 10,
      "fireball",
    );
    fb.body.allowGravity = false;
    fb.setVelocityX(dir * 480);

    this.time.delayedCall(2000, () => {
      if (fb?.active) fb.destroy();
    });
    this.time.delayedCall(300, () => {
      this.fireCooldown = false;
    });
  }

  destroyFireball(fb) {
    if (!fb?.active) return;
    const burst = this.add.circle(fb.x, fb.y, 10, 0xff8800, 0.9);
    this.tweens.add({
      targets: burst,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => burst.destroy(),
    });
    fb.destroy();
  }

  // ──────────────────────────────────────────
  //  DAÑO AL ENEMIGO
  // ──────────────────────────────────────────
  hitEnemy() {
    if (!this.enemy?.active) return;

    this.enemy.hp -= 1;
    this.enemyHpText.setText(
      "Slime enemigo: " + "♥".repeat(Math.max(0, this.enemy.hp)),
    );

    const kDir = this.enemy.x > this.player.x ? 1 : -1;
    this.enemy.setVelocity(kDir * 260, -200);
    this.enemy.state = "hurt";
    this.enemy.play("slime-hurt", true);

    this.tweens.add({
      targets: this.enemy,
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        if (this.enemy?.active) {
          this.enemy.setAlpha(1);
          if (this.enemy.hp > 0) this.enemy.state = "chase";
        }
      },
    });

    if (this.enemy.hp <= 0) {
      this.time.delayedCall(400, () => {
        if (this.enemy?.active) {
          this.enemy.destroy();
          this.enemyHpText.setText("Slime enemigo: derrotado ✓");
        }
      });
    }
  }

  // ──────────────────────────────────────────
  //  DAÑO AL JUGADOR
  // ──────────────────────────────────────────
  hitPlayer() {
    if (this.player.invincible || this.player.isDead) return;

    this.player.invincible = true;
    this.player.hp -= 1;
    this.hpText.setText("HP: " + "♥".repeat(Math.max(0, this.player.hp)));

    // Empuje (Knockback)
    const kDir = this.player.x > this.enemy.x ? 1 : -1;
    this.player.setVelocity(kDir * 300, -200);

    if (this.player.hp <= 0) {
      this.player.isDead = true;
      this.player.setVelocity(0, 0);
      this.player.body.enable = false;
      this.player.play("knight-death", true);
      this.hpText.setText("HP: muerto");
      return;
    }

    // Reproducir animación de daño
    this.player.play("knight-hurt", true);

    // EFECTO VISUAL: Parpadeo
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.player.setAlpha(1);
        this.player.invincible = false; // <--- AQUÍ se libera la invencibilidad
      },
    });
  }

  // ──────────────────────────────────────────
  //  IA DEL SLIME
  // ──────────────────────────────────────────
  updateEnemy(delta) {
    if (!this.enemy?.active || this.enemy.state === "hurt") return;

    const dist = Phaser.Math.Distance.Between(
      this.enemy.x,
      this.enemy.y,
      this.player.x,
      this.player.y,
    );
    const onGround = this.enemy.body.blocked.down;
    const isBlocked =
      this.enemy.body.blocked.left || this.enemy.body.blocked.right;
    const dirX = this.player.x > this.enemy.x ? 1 : -1;

    // 1. DETERMINAR ESTADO
    if (dist < 100) {
      this.enemy.state = "attack";
    } else if (dist < this.enemy.chaseDist) {
      this.enemy.state = "chase";
    } else {
      this.enemy.state = "patrol";
    }

    // 2. EJECUCIÓN
    switch (this.enemy.state) {
      case "patrol":
        this.enemy.patrolTimer = (this.enemy.patrolTimer || 0) + delta;
        this.enemy.setVelocityX(60 * this.enemy.dir);
        this.enemy.setFlipX(this.enemy.dir > 0);
        this.enemy.play("slime-move", true);

        // Si choca con una pared (la elevación), salta para intentar subir o cambia de dirección
        if (isBlocked && onGround) {
          this.enemy.setVelocityY(-300); // Intenta saltar el escalón
          this.enemy.patrolTimer += 1000; // Acelera el cambio de dirección si sigue bloqueado
        }

        if (this.enemy.patrolTimer > 3000) {
          this.enemy.dir *= -1;
          this.enemy.patrolTimer = 0;
        }
        break;

      case "chase":
        this.enemy.setVelocityX(140 * dirX);
        this.enemy.setFlipX(dirX > 0);
        this.enemy.play("slime-move", true);

        // SALTO ANTI-ATASCO: Si el jugador está arriba O si hay un obstáculo enfrente
        if (onGround && (isBlocked || this.player.y < this.enemy.y - 40)) {
          this.enemy.setVelocityY(-400); // Salto un poco más alto para asegurar subir
        }
        break;

      case "attack":
        this.enemy.attackTimer = (this.enemy.attackTimer || 0) + delta;

        if (this.enemy.attackTimer > 1000) {
          if (onGround) {
            this.enemy.setFlipX(dirX > 0);
            this.enemy.setVelocityX(300 * dirX);
            this.enemy.setVelocityY(-280);
            this.enemy.play("slime-attack", true);
            this.enemy.attackTimer = 0;
          }
        } else if (onGround) {
          // Si se queda trabado contra la elevación durante el cooldown de ataque, saltar
          if (isBlocked) {
            this.enemy.setVelocityY(-350);
            this.enemy.setVelocityX(100 * dirX);
          } else {
            this.enemy.setVelocityX(0);
            this.enemy.play("slime-idle", true);
          }
        }
        break;
    }
  }

  // ──────────────────────────────────────────
  //  UPDATE
  // ──────────────────────────────────────────
  update(time, delta) {
    if (this.player.isDead) return;

    const onGround = this.player.body.blocked.down;

    // Movimiento horizontal
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
      if (onGround && !this.player.isAttacking)
        this.player.play("knight-run", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
      if (onGround && !this.player.isAttacking)
        this.player.play("knight-run", true);
    } else {
      this.player.setVelocityX(0);
      if (onGround && !this.player.isAttacking)
        this.player.play("knight-idle", true);
    }

    // Salto
    if (
      (this.cursors.up.isDown || this.cursors.space.isDown) &&
      onGround &&
      !this.player.isAttacking
    ) {
      this.player.setVelocityY(-420);
      this.player.play("knight-jump", true);
    }

    // Z = ataque de espada (melee)
    if (
      Phaser.Input.Keyboard.JustDown(this.swordKey) &&
      !this.player.isAttacking
    ) {
      this.player.isAttacking = true;
      this.player.play("knight-attack", true);

      // Comprobar si el enemigo está cerca para hacer daño
      if (this.enemy?.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.enemy.x,
          this.enemy.y,
        );
        const dir = this.player.flipX ? -1 : 1;
        const enemyIsInFront =
          dir > 0 ? this.enemy.x > this.player.x : this.enemy.x < this.player.x;
        if (dist < 80 && enemyIsInFront) {
          this.time.delayedCall(150, () => this.hitEnemy());
        }
      }

      this.player.once("animationcomplete-knight-attack", () => {
        this.player.isAttacking = false;
      });
    }

    // X = bola de fuego
    if (
      Phaser.Input.Keyboard.JustDown(this.fireKey) &&
      !this.player.isAttacking
    ) {
      this.shootFireball();
    }

    this.updateEnemy(delta);
  }
}

window.addEventListener("load", () => {
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: "game",
    backgroundColor: "#87ceeb",
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: { gravity: { y: 1000 }},
    },
    scene: Main,
  });
});
