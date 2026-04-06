/// <reference path="phaser.d.ts" />

class Main extends Phaser.Scene {

  constructor() {
    super({ key: 'Main' });
  }

  preload() {

    this.load.image("background", "assets/tilemaps/maps/mapa.png");

    this.load.spritesheet("knight-idle", "assets/Caballero/IDLE.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-run", "assets/Caballero/RUN.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-attack", "assets/Caballero/ATTACK_1.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-jump", "assets/Caballero/JUMP.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-hurt", "assets/Caballero/HURT.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-death", "assets/Caballero/DEATH.png", { frameWidth: 96, frameHeight: 84 });

    this.load.spritesheet("slime", "assets/Enemigos/Slime_Green.png", { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet("coin", "assets/coin.png", { frameWidth: 16, frameHeight: 16 });

    this.load.json("coinsData", "data/coins.json");
    this.load.json("jugadorData", "data/jugador.json");
    this.load.json("enemigosData", "data/enemigos.json");
  }

  create() {

    const jData = this.cache.json.get("jugadorData")?.jugador;
    const eData = this.cache.json.get("enemigosData")?.enemigos?.find(e => e.nombre === "slime");

    this.add.image(0, 0, "background").setOrigin(0, 0);

    this.game.canvas.setAttribute("tabindex", "0");
    this.game.canvas.focus();
    this.input.on("pointerdown", () => this.game.canvas.focus());

    const fbGfx = this.make.graphics({ add: false });
    fbGfx.fillStyle(0xff6600, 1);
    fbGfx.fillCircle(6, 6, 6);
    fbGfx.fillStyle(0xffff00, 1);
    fbGfx.fillCircle(6, 6, 3);
    fbGfx.generateTexture("fireball-texture", 12, 12);
    fbGfx.destroy();

    this.platforms = this.physics.add.staticGroup();

    const crearSuelo = (x, y) => {
      let g = this.platforms.create(x, y, null);
      g.setSize(10, 20);
      g.setVisible(false);
      g.refreshBody();
    };

    const xSuelos = [90, 125, 160, 195, 230, 265, 300, 435, 465, 495, 525, 555, 585, 615, 625];

    xSuelos.forEach(x => crearSuelo(x, 420));
    [325, 355, 385, 405].forEach(x => crearSuelo(x, 385));
    [10, 35, 64, 96].forEach(x => crearSuelo(x, 345));
    crearSuelo(56, 380);
    [470, 500, 525, 550].forEach(x => crearSuelo(x, 330));

    this.player = this.physics.add.sprite(50, 280, "knight-idle");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(25, 33);
    this.player.body.setOffset(36, 29);

    this.player.hpMax = Math.ceil((jData?.vida || 75) / 25);
    this.player.hp = this.player.hpMax;
    this.player.danioBase = jData?.danio || 5;
    this.player.xp = 0;
    this.player.nivel = 1;
    this.player.xpSiguienteNivel = 50;

    this.player.invincible = false;
    this.player.isDead = false;
    this.player.isAttacking = false;

    this.physics.add.collider(this.player, this.platforms);

    this.enemies = this.physics.add.group();

    const slimeHp = Math.ceil((eData?.estadisticas?.vida || 20) / 7);
    const slimeXp = eData?.estadisticas?.experiencia || 10;
    const slimeMoney = eData?.drop?.dinero || 5;

    for (let i = 0; i < 200; i++) {

      const xSpawnAleatorio = xSuelos[Phaser.Math.Between(0, xSuelos.length - 1)];

      const enemy = this.enemies.create(xSpawnAleatorio, 390, "slime");

      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(20, 14);
      enemy.body.setOffset(6, 16);

      enemy.hp = slimeHp;
      enemy.xpReward = slimeXp;
      enemy.moneyDrop = slimeMoney;

      enemy.state = "patrol";
      enemy.dir = Math.random() > 0.5 ? 1 : -1;
      enemy.patrolTimer = 0;
      enemy.chaseDist = 180;

      enemy.play("slime-move");
    }

    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!this.player.invincible && enemy.active && !this.player.isDead) {
        this.hitPlayer(enemy);
      }
    });

    this.fireballs = this.physics.add.group();

    this.physics.add.overlap(this.fireballs, this.enemies, (fb, enemy) => {
      this.destroyFireball(fb);
      this.hitEnemy(enemy);
    });

    this.physics.add.collider(this.fireballs, this.platforms, (fb) => this.destroyFireball(fb));

    this.swordKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.fireCooldown = false;

    const anims = [
      { key: "knight-idle", asset: "knight-idle", end: 6, rate: 8, loop: -1 },
      { key: "knight-run", asset: "knight-run", end: 7, rate: 12, loop: -1 },
      { key: "knight-attack", asset: "knight-attack", end: 5, rate: 16, loop: 0 },
      { key: "knight-jump", asset: "knight-jump", end: 4, rate: 10, loop: 0 },
      { key: "knight-hurt", asset: "knight-hurt", end: 3, rate: 10, loop: 0 },
      { key: "knight-death", asset: "knight-death", end: 11, rate: 10, loop: 0 },
      { key: "slime-idle", asset: "slime", start: 0, end: 5, rate: 8, loop: -1 },
      { key: "slime-move", asset: "slime", start: 20, end: 28, rate: 10, loop: -1 },
      { key: "slime-hurt", asset: "slime", start: 36, end: 39, rate: 10, loop: 0 },
      { key: "coin-spin", asset: "coin", end: 7, rate: 10, loop: -1 }
    ];

    anims.forEach(a => {
      this.anims.create({
        key: a.key,
        frames: this.anims.generateFrameNumbers(a.asset, { start: a.start || 0, end: a.end }),
        frameRate: a.rate,
        repeat: a.loop
      });
    });

    this.coins = this.physics.add.group();

    const cData = this.cache.json.get("coinsData");

    if (cData && cData.coins) {
      cData.coins.forEach(pos => {
        const c = this.coins.create(pos.x, pos.y, "coin");
        c.body.allowGravity = false;
        c.play("coin-spin");
      });
    }

    this.physics.add.overlap(this.player, this.coins, (p, coin) => {
      coin.destroy();
      this.score += 1;
      this.scoreText.setText("Monedas: " + this.score);
    });

    this.score = jData?.dinero || 0;
    this.scoreText = this.add.text(16, 16, "Monedas: " + this.score, { fontSize: "16px", fill: "#fff" });
    this.hpText = this.add.text(16, 36, "HP: " + "♥".repeat(this.player.hp), { fontSize: "16px", fill: "#f44" });
    this.levelText = this.add.text(16, 56, `Nivel: 1 (0/50 XP)`, { fontSize: "14px", fill: "#ffdd44" });

    this.player.play("knight-idle");

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  shootFireball() {

    if (this.fireCooldown || this.player.isDead) return;

    this.fireCooldown = true;

    const dir = this.player.flipX ? -1 : 1;

    const fb = this.fireballs.create(this.player.x + dir * 20, this.player.y - 10, "fireball-texture");

    fb.body.allowGravity = false;
    fb.setVelocityX(dir * 480);

    this.time.delayedCall(2000, () => fb.active && fb.destroy());
    this.time.delayedCall(300, () => this.fireCooldown = false);
  }

  destroyFireball(fb) {

    if (!fb?.active) return;

    fb.destroy();
  }

  hitEnemy(enemy) {

    if (!enemy?.active) return;

    enemy.hp -= 1;

    enemy.play("slime-hurt", true);

    enemy.setVelocityY(-150);
    enemy.setVelocityX(enemy.x > this.player.x ? 100 : -100);

    if (enemy.hp <= 0) {

      this.score += enemy.moneyDrop;

      this.player.xp += enemy.xpReward;

      this.scoreText.setText("Monedas: " + this.score);

      this.checkLevelUp();

      enemy.destroy();
    }
  }

  checkLevelUp() {

    if (this.player.xp >= this.player.xpSiguienteNivel) {

      this.player.nivel += 1;

      this.player.xp = 0;

      this.player.xpSiguienteNivel += 50;

      this.player.hp = this.player.hpMax;

      const msg = this.add.text(this.player.x, this.player.y - 50, "¡LEVEL UP!", {
        fontSize: "20px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 4
      });

      this.tweens.add({
        targets: msg,
        y: "-=50",
        alpha: 0,
        duration: 1000,
        onComplete: () => msg.destroy()
      });
    }

    this.levelText.setText(`Nivel: ${this.player.nivel} (${this.player.xp}/${this.player.xpSiguienteNivel} XP)`);

    this.hpText.setText("HP: " + "♥".repeat(this.player.hp));
  }

  hitPlayer(enemy) {

    if (this.player.invincible || this.player.isDead) return;

    this.player.hp -= 1;

    this.hpText.setText("HP: " + "♥".repeat(Math.max(0, this.player.hp)));

    if (this.player.hp <= 0) {

      this.player.isDead = true;

      this.player.play("knight-death", true);

    } else {

      this.player.invincible = true;

      this.player.play("knight-hurt", true);

      this.player.setVelocity((this.player.x > enemy.x ? 1 : -1) * 300, -200);

      this.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          this.player.alpha = 1;
          this.player.invincible = false;
        }
      });
    }
  }

  update(time, delta) {

    if (this.player.isDead) return;

    const onGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown) {

      this.player.setVelocityX(-200);

      this.player.flipX = true;

      if (onGround && !this.player.isAttacking) this.player.play("knight-run", true);

    } else if (this.cursors.right.isDown) {

      this.player.setVelocityX(200);

      this.player.flipX = false;

      if (onGround && !this.player.isAttacking) this.player.play("knight-run", true);

    } else {

      this.player.setVelocityX(0);

      if (onGround && !this.player.isAttacking) this.player.play("knight-idle", true);
    }

    if ((this.cursors.up.isDown || this.cursors.space.isDown) && onGround) {

      this.player.setVelocityY(-420);

      this.player.play("knight-jump", true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.swordKey) && !this.player.isAttacking) {

      this.player.isAttacking = true;

      this.player.play("knight-attack", true);

      this.enemies.getChildren().forEach(enemy => {

        if (enemy.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 70) {

          this.hitEnemy(enemy);
        }
      });

      this.player.once("animationcomplete", () => this.player.isAttacking = false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) this.shootFireball();

    this.enemies.getChildren().forEach(enemy => {

      if (!enemy.active) return;

      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

      if (dist < enemy.chaseDist) {

        let dirX = this.player.x > enemy.x ? 1 : -1;

        enemy.setVelocityX(140 * dirX);

        enemy.setFlipX(dirX > 0);

      } else {

        enemy.patrolTimer += delta;

        if (enemy.patrolTimer > 2000) {

          enemy.dir *= -1;

          enemy.patrolTimer = 0;
        }

        enemy.setVelocityX(60 * enemy.dir);

        enemy.setFlipX(enemy.dir > 0);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  parent: "game",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1000 } }
  },
  scene: Main
};

new Phaser.Game(config);
