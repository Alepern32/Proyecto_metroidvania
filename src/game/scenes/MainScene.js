import * as Phaser from 'phaser';
import Enemy from '../entities/Enemy';
import Player from '../entities/Player';

export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Main' });
  }

  // ── Carga todos los assets antes de crear la escena ──────────────────────
  preload() {
    this.load.image("background", "assets/tilemaps/maps/mapa.png");

    // Spritesheets del caballero (jugador)
    this.load.spritesheet("knight-idle", "assets/Caballero/IDLE.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-run", "assets/Caballero/RUN.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-attack", "assets/Caballero/ATTACK_1.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-jump", "assets/Caballero/JUMP.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-hurt", "assets/Caballero/HURT.png", { frameWidth: 96, frameHeight: 84 });
    this.load.spritesheet("knight-death", "assets/Caballero/DEATH.png", { frameWidth: 96, frameHeight: 84 });

    // Spritesheets de enemigos
    this.load.spritesheet("enemy-slime", "assets/Enemigos/Slime_Green.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("enemy-murcielago", "assets/Enemigos/32x32-bat-sprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("enemy-planta_saltarina", "assets/Enemigos/planta_saltarina.png", { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet("coin", "assets/coin.png", { frameWidth: 16, frameHeight: 16 });

    // Datos del juego en JSON
    this.load.json("coinsData", "data/coins.json");
    this.load.json("jugadorData", "data/jugador.json");
    this.load.json("enemigosData", "data/enemigos.json");
  }

  // ── Construye el mundo del juego al iniciar la escena ────────────────────
  create() {

    const jData = this.cache.json.get("jugadorData")?.jugador || {};
    const enemigosArr = this.cache.json.get("enemigosData")?.enemigos || [];
    const cData = this.cache.json.get("coinsData");

    // ── Lee la flag de nueva partida desde el registry de Phaser ─────────
    // Si es nueva partida ignora el guardado aunque exista en localStorage
    const esNuevaPartida = this.registry.get("esNuevaPartida");
    const raw = esNuevaPartida ? null : localStorage.getItem("partidaGuardada");
    const save = raw ? JSON.parse(raw) : null;

    // ── Fondo y límites del mundo ─────────────────────────────────────────
    this.physics.world.setBounds(0, 0, 640, 480);
    this.add.image(0, 0, "background").setOrigin(0, 0);

    // Con input.keyboard.target=window en la config de Phaser, el teclado
    // escucha en window directamente y no depende del foco del canvas.
    this.input.keyboard.enabled = true;

    // ── Genera textura de bola de fuego en tiempo de ejecución ───────────
    const fbGfx = this.make.graphics({ add: false });
    fbGfx.fillStyle(0xff6600); fbGfx.fillCircle(6, 6, 6);
    fbGfx.fillStyle(0xffff00); fbGfx.fillCircle(6, 6, 3);
    fbGfx.generateTexture("fireball-texture", 12, 12);
    fbGfx.destroy();

    // ── Plataformas invisibles que forman el suelo y niveles del mapa ─────
    this.xSuelos = [90, 125, 160, 195, 230, 265, 300, 435, 465, 495, 525, 555, 585, 615, 625];
    this.platforms = this.physics.add.staticGroup();

    const crearPlataforma = (x, y) => {
      const p = this.platforms.create(x, y, null);
      p.setSize(10, 20).setVisible(false).refreshBody();
    };

    this.xSuelos.forEach(x => crearPlataforma(x, 420));
    [325, 355, 385, 405].forEach(x => crearPlataforma(x, 385));
    [10, 35, 64, 96].forEach(x => crearPlataforma(x, 345));
    crearPlataforma(56, 380);
    [470, 500, 525, 550].forEach(x => crearPlataforma(x, 330));

    // ── Animaciones del caballero ─────────────────────────────────────────
    this.anims.create({ key: "knight-idle", frames: this.anims.generateFrameNumbers("knight-idle", { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "knight-run", frames: this.anims.generateFrameNumbers("knight-run", { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
    this.anims.create({ key: "knight-attack", frames: this.anims.generateFrameNumbers("knight-attack", { start: 0, end: 5 }), frameRate: 16, repeat: 0 });
    this.anims.create({ key: "knight-jump", frames: this.anims.generateFrameNumbers("knight-jump", { start: 0, end: 4 }), frameRate: 10, repeat: 0 });
    this.anims.create({ key: "knight-hurt", frames: this.anims.generateFrameNumbers("knight-hurt", { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
    this.anims.create({ key: "knight-death", frames: this.anims.generateFrameNumbers("knight-death", { start: 0, end: 11 }), frameRate: 10, repeat: 0 });

    // ── Animaciones de enemigos ───────────────────────────────────────────
    this.anims.create({ key: "slime-move", frames: this.anims.generateFrameNumbers("enemy-slime", { start: 20, end: 28 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "slime-hurt", frames: this.anims.generateFrameNumbers("enemy-slime", { start: 36, end: 39 }), frameRate: 10, repeat: 0 });

    this.anims.create({ key: "bat-fly", frames: this.anims.generateFrameNumbers("enemy-murcielago", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "bat-hurt", frames: this.anims.generateFrameNumbers("enemy-murcielago", { start: 8, end: 11 }), frameRate: 12, repeat: 0 });

    this.anims.create({ key: "plant-move", frames: this.anims.generateFrameNumbers("enemy-planta_saltarina", { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "plant-hurt", frames: this.anims.generateFrameNumbers("enemy-planta_saltarina", { start: 6, end: 9 }), frameRate: 10, repeat: 0 });

    this.anims.create({ key: "coin-spin", frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });

    // ── Jugador: posición y stats desde guardado o desde JSON ─────────────
    const spawnX = save?.posicionX ?? 50;
    const spawnY = save?.posicionY ?? 280;
    this.playerObj = new Player(this, spawnX, spawnY, jData);
    this.player = this.playerObj.sprite;

    // ── Si hay partida guardada, sobreescribe los stats con los guardados ─
    // Incluye danioBase y defensa para que los bonus de nivel persistan
    if (save) {
      this.player.hp        = save.vida      ?? this.player.hp;
      this.player.hpMax     = save.vidaMax   ?? this.player.hpMax;
      this.player.xp        = save.xp        ?? this.player.xp;
      this.player.danioBase = save.danioBase ?? this.player.danioBase;
      this.player.defensa   = save.defensa   ?? this.player.defensa;
      this.playerObj.recalcularNivel(save.nivel ?? this.player.nivel);

    }

    this.physics.add.collider(this.player, this.platforms);
    this.player.play("knight-idle");

    // ── Enemigos ──────────────────────────────────────────────────────────
    this.enemies = this.physics.add.group();
    const pesos = [0.6, 0.25, 0.15];

    for (let i = 0; i < 50; i++) {
      const x = this.xSuelos[Phaser.Math.Between(0, this.xSuelos.length - 1)];
      const rand = Math.random();
      let idx = 0, acum = 0;
      for (let j = 0; j < pesos.length; j++) {
        acum += pesos[j];
        if (rand < acum) { idx = j; break; }
      }
      Enemy.spawn(this, x, enemigosArr[idx]);
    }

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, (p, enemy) => {
      if (!this.player.invincible && enemy.active && !this.player.isDead) {
        this.playerObj.hit(enemy);
      }
    });

    // ── Bolas de fuego ────────────────────────────────────────────────────
    this.fireballs = this.physics.add.group();
    this.physics.add.overlap(this.fireballs, this.enemies, (fb, enemy) => {
      if (fb.active) fb.destroy();
      this.hitEnemy(enemy);
    });
    this.physics.add.collider(this.fireballs, this.platforms, (fb) => {
      if (fb.active) fb.destroy();
    });

    // ── Monedas ───────────────────────────────────────────────────────────
    this.coins = this.physics.add.group();
    if (cData?.coins) {
      cData.coins.forEach(pos => {
        const c = this.coins.create(pos.x, pos.y, "coin");
        c.body.allowGravity = false;
        c.play("coin-spin");
      });
    }
    this.physics.add.overlap(this.player, this.coins, (p, coin) => {
      coin.destroy();
      this.score += 1;
      this.scoreText.setText("🪙 " + this.score);
    });

    // ── HUD ───────────────────────────────────────────────────────────────
    this.score = save?.oro ?? jData.dinero ?? 0;
    this.scoreText = this.add.text(16, 12, "🪙 " + this.score, { fontSize: "13px", fill: "#ffd700", stroke: "#000", strokeThickness: 3 }).setScrollFactor(0).setDepth(100);

    this.add.text(16, 30, "❤", { fontSize: "11px", fill: "#ff6666", stroke: "#000", strokeThickness: 2 }).setScrollFactor(0).setDepth(100);
    this.hpBarBg = this.add.rectangle(32, 36, 140, 10, 0x330000).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.hpBar = this.add.rectangle(32, 36, 140, 10, 0x44ff44).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.hpValText = this.add.text(102, 36, "", { fontSize: "9px", fill: "#fff", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101);

    this.levelText = this.add.text(16, 50, "Nv." + this.player.nivel, { fontSize: "10px", fill: "#ffdd44", stroke: "#000", strokeThickness: 2 }).setScrollFactor(0).setDepth(100);

    this.add.text(16, 63, "XP", { fontSize: "9px", fill: "#aaddff", stroke: "#000", strokeThickness: 2 }).setScrollFactor(0).setDepth(100);
    this.xpBarBg = this.add.rectangle(32, 68, 130, 7, 0x001133).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.xpBar = this.add.rectangle(32, 68, 0, 7, 0x44aaff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.xpValText = this.add.text(97, 68, "", { fontSize: "8px", fill: "#fff", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101);

    this.updateHpBar();
    this.updateXpBar();

    // ── Controles de teclado ──────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.swordKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.fireCooldown = false;

    // ── Evento de guardado desde React ────────────────────────────────────
    // React dispara "guardarPartida" en window y Phaser lo captura aquí
    this._onGuardar = () => {
      const estado = {
        vida:      this.player.hp,
        vidaMax:   this.player.hpMax,
        oro:       this.score,
        nivel:     this.player.nivel,
        xp:        this.player.xp,
        // ── Guarda también daño y defensa para que persistan los bonus de nivel ──
        danioBase: this.player.danioBase,
        defensa:   this.player.defensa,
        posicionX: Math.round(this.player.x),
        posicionY: Math.round(this.player.y),
      };
      localStorage.setItem("partidaGuardada", JSON.stringify(estado));
      console.log("✅ Partida guardada:", estado);
    };
    window.addEventListener("guardarPartida", this._onGuardar);

    // ── Limpieza completa al destruir/cerrar la escena ───────────────────
    this.events.on("shutdown", () => {
      window.removeEventListener("guardarPartida", this._onGuardar);
      // Elimina las teclas para evitar listeners duplicados al recrear Phaser
      if (this.swordKey) this.input.keyboard.removeKey(this.swordKey);
      if (this.fireKey) this.input.keyboard.removeKey(this.fireKey);
      this.input.keyboard.removeAllKeys(true);
    });
  }

  // ── Actualiza la barra de HP del jugador en el HUD ───────────────────────
  updateHpBar() {
    const p = this.player;
    const pct = Math.max(0, p.hp / p.hpMax);
    this.hpBar.width = 140 * pct;
    this.hpBar.setFillStyle(pct > 0.6 ? 0x44ff44 : pct > 0.3 ? 0xffaa00 : 0xff2222);
    this.hpValText.setText(Math.ceil(p.hp) + "/" + p.hpMax);
  }

  // ── Actualiza la barra de XP y el texto de nivel en el HUD ───────────────
  updateXpBar() {
    const p = this.player;
    const pct = Math.min(1, p.xp / p.xpSiguienteNivel);
    this.xpBar.width = 130 * pct;
    this.xpValText.setText(p.xp + "/" + p.xpSiguienteNivel);
    this.levelText.setText("Nv." + p.nivel);
  }

  // ── Muestra texto de daño flotante que sube y desaparece ─────────────────
  spawnDamageText(x, y, amount, color) {
    if (amount <= 0) return;
    const t = this.add.text(x, y, "-" + amount, {
      fontSize: "14px", fontStyle: "bold",
      fill: color || "#ffffff", stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5, 1).setDepth(300);

    const offsetX = Phaser.Math.Between(-15, 15);
    this.tweens.add({
      targets: t, x: t.x + offsetX, y: t.y - 45, alpha: 0, duration: 900,
      ease: "Power2", onComplete: () => t.destroy()
    });
  }

  // ── Aplica daño a un enemigo, gestiona muerte y recompensas ──────────────
  hitEnemy(enemy) {
    if (!enemy?.active) return;

    const danoFinal = Math.max(1, this.player.danioBase - Math.floor((enemy.defensa || 0) * 0.5));
    const danoAplicado = Math.min(danoFinal, enemy.hp);
    enemy.hp -= danoAplicado;

    this.spawnDamageText(enemy.x, enemy.y - 16, danoAplicado, "#ffffff");
    if (enemy.updateHpBar) enemy.updateHpBar();

    enemy.setTint(0xff0000);
    this.time.delayedCall(160, () => { if (enemy.active) enemy.clearTint(); });

    if (enemy.hp <= 0) {
      if (Math.random() < (enemy.dropProb ?? 1)) {
        this.score += enemy.moneyDrop;
        this.scoreText.setText("🪙 " + this.score);
      }
      this.player.xp += enemy.xpReward;
      this.checkLevelUp();
      enemy.destroy();
      return;
    }

    try {
      const hurtAnim = Enemy.animHurt(enemy.tipo);
      const moveAnim = Enemy.animMove(enemy.tipo);
      if (this.anims.exists(hurtAnim) && this.anims.exists(moveAnim)) {
        enemy.play(hurtAnim, true);
        enemy.once("animationcomplete", (a) => {
          if (a.key === hurtAnim && enemy.active) enemy.play(moveAnim, true);
        });
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) { /* empty */ }
    enemy.setVelocityY(-120);
    enemy.setVelocityX(enemy.x > this.player.x ? 90 : -90);
  }

  // ── Lanza una bola de fuego en la dirección que mira el jugador ──────────
  shootFireball() {
    if (this.fireCooldown || this.player.isDead) return;
    this.fireCooldown = true;
    const dir = this.player.flipX ? -1 : 1;
    const fb = this.fireballs.create(this.player.x + dir * 20, this.player.y - 10, "fireball-texture");
    fb.body.allowGravity = false;
    fb.setVelocityX(dir * 500);
    this.time.delayedCall(2000, () => fb?.active && fb.destroy());
    this.time.delayedCall(350, () => this.fireCooldown = false);
  }

  // ── Comprueba si el jugador sube de nivel ─────────────────────────────────
  checkLevelUp() {
    const p = this.player;
    if (p.xp >= p.xpSiguienteNivel) {
      const subio = this.playerObj.subirNivel();
      if (subio) {
        const msg = this.add.text(p.x, p.y - 40, "⬆ LEVEL UP  Nv." + p.nivel, {
          fontSize: "18px", fill: "#ffdd00", stroke: "#000", strokeThickness: 4, fontStyle: "bold"
        }).setDepth(300);
        this.tweens.add({ targets: msg, y: "-=70", alpha: 0, duration: 1600, onComplete: () => msg.destroy() });
      }
    }
    this.updateXpBar();
    this.updateHpBar();
  }

  // ── Bucle principal: controles, movimiento y IA de enemigos ──────────────
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
      const enemigosCerca = this.enemies.getChildren().filter(enemy =>
        enemy.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 70
      );
      enemigosCerca.forEach(enemy => this.hitEnemy(enemy));
      this.player.once("animationcomplete", () => this.player.isAttacking = false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) this.shootFireball();

    this.enemies.getChildren().forEach(enemy => {
      Enemy.updateAI(enemy, this.player, delta);
      if (enemy.updateHpBar) enemy.updateHpBar();
    });
  }
}