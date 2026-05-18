import * as Phaser from "phaser";
import Enemy from "../entities/Enemy";
import Player from "../entities/Player";

// ── Dimensiones del mundo (110 tiles × 32px, 33 tiles × 32px) ────────────────
const MAP_W = 110 * 32; // 3520 px
const MAP_H = 33 * 32; // 1056 px

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "Main" });
  }

  // ── Carga todos los assets antes de crear la escena ──────────────────────
  preload() {
    this.load.tilemapTiledJSON(
      "mapa_bosque",
      "assets/tilemaps/maps/Mapa_Bosque.json",
    );

    this.load.image(
      "tileset_pixel_woods",
      "assets/tilemaps/Sprites/Pixel Woods Asset Pack/Pixel Woods Asset Pack/Tileset/Pixel_Woods_Tileset.png",
    );
    this.load.image(
      "tileset_dungeon",
      "assets/tilemaps/Sprites/Dungeon Tile Set/Dungeon Tile Set/Dungeon Tile Set.png",
    );
    this.load.image(
      "tileset_snow",
      "assets/tilemaps/Sprites/Snow platform tileset/Snow platform tileset.png",
    );
    this.load.image(
      "tileset_cueva",
      "assets/tilemaps/Sprites/PixelFantasy_Caves_1.0/mainlev_build.png",
    );
    this.load.image("tileset_cofre", "assets/tilemaps/Sprites/cofre.png");
    this.load.image("tileset_v1", "assets/tilemaps/Sprites/TileSet_V1.png");
    this.load.image("tileset_nubes", "assets/tilemaps/Sprites/nubes.jpg");

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

    // Spritesheets de enemigos
    this.load.spritesheet("enemy-slime", "assets/Enemigos/Slime_Green.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "enemy-murcielago",
      "assets/Enemigos/32x32-bat-sprite.png",
      { frameWidth: 32, frameHeight: 32 },
    );
    this.load.spritesheet(
      "enemy-planta_saltarina",
      "assets/Enemigos/planta_saltarina.png",
      { frameWidth: 32, frameHeight: 48 },
    );
    this.load.spritesheet("coin", "assets/coin.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.json("coinsData", "data/coins.json");
    this.load.json("jugadorData", "data/jugador.json");
    this.load.json("enemigosData", "data/enemigos.json");
  }

  // ── Construye el mundo del juego ─────────────────────────────────────────
  create() {
    const jData = this.cache.json.get("jugadorData")?.jugador || {};
    const enemigosArr = this.cache.json.get("enemigosData")?.enemigos || [];
    const cData = this.cache.json.get("coinsData");

    const esNuevaPartida = this.registry.get("esNuevaPartida");
    const raw = esNuevaPartida ? null : localStorage.getItem("partidaGuardada");
    const save = raw ? JSON.parse(raw) : null;

    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);

    // ── Tilemap ───────────────────────────────────────────────────────────
    const map = this.make.tilemap({ key: "mapa_bosque" });

    const tsPW =
      map.addTilesetImage("Pixel_Woods_Tileset", "tileset_pixel_woods") ?? null;
    const tsDu = map.addTilesetImage("Dungeon", "tileset_dungeon") ?? null;
    const tsS = map.addTilesetImage("Nieve", "tileset_snow") ?? null;
    const tsC = map.addTilesetImage("Cueva", "tileset_cueva") ?? null;
    const tsCo = map.addTilesetImage("cofre", "tileset_cofre") ?? null;
    const tsV = map.addTilesetImage("TileSet_V1", "tileset_v1") ?? null;
    const tsN =
      map.addTilesetImage(
        "pixel-art-sky-background-with-clouds-cloudy-blue-sky-for-8bit-game-on-white-background-vector",
        "tileset_nubes",
      ) ?? null;

    const allTs = [tsPW, tsDu, tsS, tsC, tsCo, tsV, tsN].filter(Boolean);

    // ── Fondo de nubes ────────────────────────────────────────────────────
    // ── Fondo de nubes ────────────────────────────────────────────────────
    const fondoLayer = map.getObjectLayer("Fondo");
    if (fondoLayer) {
      fondoLayer.objects.forEach((obj) => {
        let x = obj.x;
        let y = obj.y;

        const img = this.add
          .image(x, y, "tileset_nubes")
          .setDisplaySize(obj.width, obj.height)
          .setAlpha(0.67)
          .setDepth(-10)
          .setOrigin(0, 0);

        if (obj.rotation === 180 || obj.rotation === -180) {
          img.setPosition(x - obj.width, y);
          img.setFlip(true, true);
        }
      });
    }

    // ── Capas de fondo (sin colisión) ─────────────────────────────────────
    this.crearCapa(map, allTs, "Suelo 2");
    this.crearCapa(map, allTs, "Capa de patrones 1");
    this.crearCapa(map, allTs, "Cueva Profundidad 2");
    this.crearCapa(map, allTs, "Agua 2");
    this.crearCapa(map, allTs, "Cueva Profundidad");
    this.crearCapa(map, allTs, "Suelo 3");
    this.crearCapa(map, allTs, "Cueva profundidad negro");

    // ── Capa de suelo principal CON colisión ──────────────────────────────
    this.groundLayer = this.crearCapa(map, allTs, "Suelo");
    if (this.groundLayer) {
      this.groundLayer.setCollisionByExclusion([-1]);

      // Solo colisiona por la cara SUPERIOR de cada tile.
      // Así el jugador y los enemigos no chocan con los lados ni con la parte
      // inferior al saltar desde abajo, evitando el "techo invisible".
    }

    // ── Capas decorativas (por encima del jugador) ────────────────────────
    this.crearCapa(map, allTs, "Decoraciones");
    this.crearCapa(map, allTs, "Arbol");
    this.crearCapa(map, allTs, "Cofres");

    // ── Capas de objetos (Pasto, Arboles, Cofres) ─────────────────────────
    const tsKeyMap = {
      Pixel_Woods_Tileset: "tileset_pixel_woods",
      Dungeon: "tileset_dungeon",
      Nieve: "tileset_snow",
      Cueva: "tileset_cueva",
      cofre: "tileset_cofre",
      TileSet_V1: "tileset_v1",
    };

    ["Pasto", "Arboles"].forEach((nombreCapa) => {
      const layer = map.getObjectLayer(nombreCapa);
      if (!layer) return;

      layer.objects.forEach((obj) => {
        if (!obj.gid) return;

        const tileset = map.tilesets
          .slice()
          .reverse()
          .find((ts) => obj.gid >= ts.firstgid);
        if (!tileset) return;

        const textureKey = tsKeyMap[tileset.name];
        if (!textureKey) return;

        const localId = obj.gid - tileset.firstgid;
        const cols = tileset.columns || 1;
        const tw = tileset.tileWidth;
        const th = tileset.tileHeight;
        const tx = (localId % cols) * tw;
        const ty = Math.floor(localId / cols) * th;

        const frameKey = `${textureKey}__${localId}`;
        const texture = this.textures.get(textureKey);
        if (!texture) return;

        if (!texture.has(frameKey)) {
          texture.add(frameKey, 0, tx, ty, tw, th);
        }

        this.add
          .image(obj.x, obj.y, textureKey, frameKey)
          .setOrigin(0, 1)
          .setDisplaySize(obj.width, obj.height)
          .setDepth(nombreCapa === "Cofres" ? 10 : 2);
      });
    });

    // ── Textura de bola de fuego ──────────────────────────────────────────
    const fbGfx = this.make.graphics({ add: false });
    fbGfx.fillStyle(0xff6600);
    fbGfx.fillCircle(6, 6, 6);
    fbGfx.fillStyle(0xffff00);
    fbGfx.fillCircle(6, 6, 3);
    fbGfx.generateTexture("fireball-texture", 12, 12);
    fbGfx.destroy();

    this.xSuelos = [];
    this.platforms = this.physics.add.staticGroup();


    // ── Fila de 5 cubos de colisión ───────────────────────────────────────
    const cuboInicioX = 1650;
    const cuboY       = 590;
    const cuboW       = 32;
    const cuboH       = 32;

    for (let i = 0; i < 5; i++) {
      const cx = cuboInicioX + i * cuboW;

      const c = this.platforms.create(cx, cuboY, null);
      c.setVisible(false);
      c.setSize(cuboW, cuboH);
      c.refreshBody();
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── Animaciones del caballero ─────────────────────────────────────────
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

    // ── Animaciones de enemigos ───────────────────────────────────────────
    this.anims.create({
      key: "slime-move",
      frames: this.anims.generateFrameNumbers("enemy-slime", {
        start: 20,
        end: 28,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "slime-hurt",
      frames: this.anims.generateFrameNumbers("enemy-slime", {
        start: 36,
        end: 39,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.anims.create({
      key: "bat-fly",
      frames: this.anims.generateFrameNumbers("enemy-murcielago", {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "bat-hurt",
      frames: this.anims.generateFrameNumbers("enemy-murcielago", {
        start: 8,
        end: 11,
      }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: "plant-move",
      frames: this.anims.generateFrameNumbers("enemy-planta_saltarina", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "plant-hurt",
      frames: this.anims.generateFrameNumbers("enemy-planta_saltarina", {
        start: 6,
        end: 9,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.anims.create({
      key: "coin-spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    // ── Jugador ───────────────────────────────────────────────────────────
    // El hitbox (setBodySize/setOffset/checkCollision.up) se configura
    // dentro de Player.js para mantenerlo todo en un solo sitio.
    const spawnX = save?.posicionX ?? 90;
    const spawnY = save?.posicionY ?? 750;
    this.playerObj = new Player(this, spawnX, spawnY, jData);
    this.player = this.playerObj.sprite;

    if (save) {
      this.player.hp = save.vida ?? this.player.hp;
      this.player.hpMax = save.vidaMax ?? this.player.hpMax;
      this.player.xp = save.xp ?? this.player.xp;
      this.player.danioBase = save.danioBase ?? this.player.danioBase;
      this.player.defensa = save.defensa ?? this.player.defensa;
      this.playerObj.recalcularNivel(save.nivel ?? this.player.nivel);
    }

    if (this.groundLayer)
      this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.platforms);
    this.player.play("knight-idle");

    // ── Enemigos ──────────────────────────────────────────────────────────
    // El hitbox y checkCollision.up de cada tipo se configura dentro de Enemy.js
    this.enemies = this.physics.add.group();
    const pesos = [0.6, 0.25, 0.15];
    const spawnXs = [
      700, 800, 900, 1000, 2700, 2900, 3100, 3300, 1500, 1700, 1900, 2100, 2400,
      2500,
    ];

    for (let i = 0; i < 50; i++) {
      const x = spawnXs[Phaser.Math.Between(0, spawnXs.length - 1)];
      const rand = Math.random();
      let idx = 0,
        acum = 0;
      for (let j = 0; j < pesos.length; j++) {
        acum += pesos[j];
        if (rand < acum) {
          idx = j;
          break;
        }
      }
      Enemy.spawn(this, x, enemigosArr[idx]);
    }

    if (this.groundLayer)
      this.physics.add.collider(this.enemies, this.groundLayer);
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
    if (this.groundLayer) {
      this.physics.add.collider(this.fireballs, this.groundLayer, (fb) => {
        if (fb.active) fb.destroy();
      });
    }

    // ── Monedas ───────────────────────────────────────────────────────────
    this.coins = this.physics.add.group();
    if (cData?.coins) {
      cData.coins.forEach((pos) => {
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
    const HX = 120; // margen izquierdo — sube este número para moverlo más a la derecha

    this.score = save?.oro ?? jData.dinero ?? 0;
    this.scoreText = this.add
      .text(HX - 8, 120, "🪙 " + this.score, {
        fontSize: "16px",
        fill: "#ffd700",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(HX - 2, 68, "❤", {
        fontSize: "14px",
        fill: "#ff6666",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.hpBarBg = this.add
      .rectangle(HX + 20, 75, 160, 8, 0x330000)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.hpBar = this.add
      .rectangle(HX + 20, 75, 160, 8, 0x44ff44)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.hpValText = this.add
      .text(HX + 185, 65, "", {
        fontSize: "12px",
        fill: "#ffffff",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(HX - 5, 90, "⭐", {
        fontSize: "14px",
        fill: "#aaffaa",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.xpBarBg = this.add
      .rectangle(HX + 20, 100, 160, 8, 0x002200)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.xpBar = this.add
      .rectangle(HX + 20, 100, 160, 8, 0x00cc44)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.xpValText = this.add
      .text(HX + 185, 92, "", {
        fontSize: "12px",
        fill: "#aaffaa",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.levelText = this.add
      .text(this.scale.width - 270, 70, "Nv.1", {
        fontSize: "16px",
        fill: "#ffffff",
        stroke: "#000",
        strokeThickness: 3,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.updateHpBar();
    this.updateXpBar();

    // ── Controles ─────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.swordKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z,
    );
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.debugKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D,
    );
    this.input.keyboard.enabled = true;

    // ── Cámara ────────────────────────────────────────────────────────────
    const { width, height } = this.scale;

    this.cameras.main
      .setBounds(0, 0, MAP_W, MAP_H)
      .setZoom(1.25)
      .startFollow(this.player, true, 0.1, 0.1);

    this.scale.on("resize", (gameSize) => {
      this.cameras.main.setSize(gameSize.width, gameSize.height);
      this.levelText.setX(gameSize.width - 80);
    });

    // ── Guardado ──────────────────────────────────────────────────────────
    this._onGuardar = () => {
      const estado = {
        vida: this.player.hp,
        vidaMax: this.player.hpMax,
        oro: this.score,
        nivel: this.player.nivel,
        xp: this.player.xp,
        danioBase: this.player.danioBase,
        defensa: this.player.defensa,
        posicionX: Math.round(this.player.x),
        posicionY: Math.round(this.player.y),
      };
      localStorage.setItem("partidaGuardada", JSON.stringify(estado));
      console.log("✅ Partida guardada:", estado);
    };
    window.addEventListener("guardarPartida", this._onGuardar);

    this.events.on("shutdown", () => {
      window.removeEventListener("guardarPartida", this._onGuardar);
      if (this.swordKey) this.input.keyboard.removeKey(this.swordKey);
      if (this.fireKey) this.input.keyboard.removeKey(this.fireKey);
      if (this.debugKey) this.input.keyboard.removeKey(this.debugKey);
      this.input.keyboard.removeAllKeys(true);
    });
  }

  // ── Helper: crea capa del tilemap sin romper si no existe ────────────────
  crearCapa(map, tilesets, nombre) {
    try {
      const layer = map.createLayer(nombre, tilesets, 0, 0);
      if (!layer) {
        console.warn(`[Tilemap] Capa "${nombre}" no encontrada — se ignora.`);
        return null;
      }
      return layer;
    } catch (e) {
      console.warn(`[Tilemap] Error al crear capa "${nombre}":`, e.message);
      return null;
    }
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

  // ── Texto de daño flotante ────────────────────────────────────────────────
  spawnDamageText(x, y, amount, color) {
    if (amount <= 0) return;
    const t = this.add
      .text(x, y, "-" + amount, {
        fontSize: "14px",
        fontStyle: "bold",
        fill: color || "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(300);

    const offsetX = Phaser.Math.Between(-15, 15);
    this.tweens.add({
      targets: t,
      x: t.x + offsetX,
      y: t.y - 45,
      alpha: 0,
      duration: 900,
      ease: "Power2",
      onComplete: () => t.destroy(),
    });
  }

  // ── Daño a enemigo ────────────────────────────────────────────────────────
  hitEnemy(enemy) {
    if (!enemy?.active) return;

    const danoFinal = Math.max(
      1,
      this.player.danioBase - Math.floor((enemy.defensa || 0) * 0.5),
    );
    const danoAplicado = Math.min(danoFinal, enemy.hp);
    enemy.hp -= danoAplicado;

    this.spawnDamageText(enemy.x, enemy.y - 16, danoAplicado, "#ffffff");
    if (enemy.updateHpBar) enemy.updateHpBar();

    enemy.setTint(0xff0000);
    this.time.delayedCall(160, () => {
      if (enemy.active) enemy.clearTint();
    });

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
    } catch (e) {
      /* empty */
    }

    enemy.setVelocityY(-120);
    enemy.setVelocityX(enemy.x > this.player.x ? 90 : -90);
  }

  // ── Bola de fuego ─────────────────────────────────────────────────────────
  shootFireball() {
    if (this.fireCooldown || this.player.isDead) return;
    this.fireCooldown = true;
    const dir = this.player.flipX ? -1 : 1;
    const fb = this.fireballs.create(
      this.player.x + dir * 20,
      this.player.y - 10,
      "fireball-texture",
    );
    fb.body.allowGravity = false;
    fb.setVelocityX(dir * 500);
    this.time.delayedCall(2000, () => fb?.active && fb.destroy());
    this.time.delayedCall(350, () => (this.fireCooldown = false));
  }

  // ── Level up ──────────────────────────────────────────────────────────────
  checkLevelUp() {
    const p = this.player;
    if (p.xp >= p.xpSiguienteNivel) {
      const subio = this.playerObj.subirNivel();
      if (subio) {
        const msg = this.add
          .text(p.x, p.y - 40, "⬆ LEVEL UP  Nv." + p.nivel, {
            fontSize: "18px",
            fill: "#ffdd00",
            stroke: "#000",
            strokeThickness: 4,
            fontStyle: "bold",
          })
          .setDepth(300);
        this.tweens.add({
          targets: msg,
          y: "-=70",
          alpha: 0,
          duration: 1600,
          onComplete: () => msg.destroy(),
        });
      }
    }
    this.updateXpBar();
    this.updateHpBar();
  }

  // ── Bucle principal ───────────────────────────────────────────────────────
  update(time, delta) {
    if (this.player.isDead) return;

    const onGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.flipX = true;
      if (onGround && !this.player.isAttacking)
        this.player.play("knight-run", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.flipX = false;
      if (onGround && !this.player.isAttacking)
        this.player.play("knight-run", true);
    } else {
      this.player.setVelocityX(0);
      if (onGround && !this.player.isAttacking)
        this.player.play("knight-idle", true);
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space)
    ) {
      this.player.setVelocityY(-420);
      this.player.play("knight-jump", true);
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.swordKey) &&
      !this.player.isAttacking
    ) {
      this.player.isAttacking = true;
      this.player.play("knight-attack", true);
      const enemigosCerca = this.enemies
        .getChildren()
        .filter(
          (enemy) =>
            enemy.active &&
            Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              enemy.x,
              enemy.y,
            ) < 70,
        );
      enemigosCerca.forEach((enemy) => this.hitEnemy(enemy));
      this.player.once(
        "animationcomplete",
        () => (this.player.isAttacking = false),
      );
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) this.shootFireball();

    // ── D → debug de colisiones ───────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      const enabled = !this.physics.world.drawDebug;
      this.physics.world.drawDebug = enabled;
      if (enabled) {
        this.physics.world.debugGraphic?.clear();
        this.physics.world.createDebugGraphic();
      } else {
        this.physics.world.debugGraphic?.clear();
        this.physics.world.debugGraphic?.destroy();
        this.physics.world.debugGraphic = null;
      }
    }

    this.enemies.getChildren().forEach((enemy) => {
      Enemy.updateAI(enemy, this.player, delta);
      if (enemy.updateHpBar) enemy.updateHpBar();
    });
  }
}