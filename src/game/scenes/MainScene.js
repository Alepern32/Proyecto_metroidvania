// ── MainScene.js – Metroidvania Professional Edition ─────────────────────────

import * as Phaser from "phaser";
import Enemy from "../entities/Enemy";
import Player from "../entities/Player";
import Hud from "../ui/Hud";
import { SaveManager } from "../utils/SaveManager";

// ── Dimensiones del mundo (110×68 tiles) ──────────────────────────────────────
const MAP_W = 110 * 32; // 3520 px
const MAP_H = 68 * 32; // 2176 px

// ── Orbes de habilidad ────────────────────────────────────────────────────────
const ORBE_DOBLE_SALTO = { x: 768, y: 830 };
const ORBE_DASH = { x: 380, y: 1340 };

// ── Cofres ─────────────────────────────────────────────────────────────────────
const COFRES_DATA = [
  // Bosque
  {
    x: 1632,
    y: 64,
    dinero: 25,
    bonus: { tipo: "daño", valor: 2 },
    zona: "bosque",
    label: "+2 Daño",
  },
  {
    x: 2944,
    y: 224,
    dinero: 25,
    bonus: { tipo: "vida", valor: 8 },
    zona: "bosque",
    label: "+8 HP Máx",
  },
  {
    x: 2176,
    y: 320,
    dinero: 20,
    bonus: { tipo: "moneda", valor: 20 },
    zona: "bosque",
    label: "x20 Monedas",
  },
  {
    x: 1536,
    y: 896,
    dinero: 15,
    bonus: { tipo: "vida", valor: 5 },
    zona: "bosque",
    label: "+5 HP Máx",
  },
  {
    x: 2496,
    y: 960,
    dinero: 20,
    bonus: { tipo: "moneda", valor: 15 },
    zona: "bosque",
    label: "x15 Monedas",
  },
  // Cueva
  {
    x: 2016,
    y: 1216,
    dinero: 30,
    bonus: { tipo: "defensa", valor: 1 },
    zona: "cueva",
    label: "+1 Defensa",
  },
  {
    x: 1088,
    y: 1280,
    dinero: 40,
    bonus: { tipo: "daño", valor: 3 },
    zona: "cueva",
    label: "+3 Daño",
  },
  {
    x: 192,
    y: 1408,
    dinero: 20,
    bonus: { tipo: "vida", valor: 5 },
    zona: "cueva",
    label: "+5 HP Máx",
  },
  {
    x: 704,
    y: 1440,
    dinero: 25,
    bonus: { tipo: "moneda", valor: 20 },
    zona: "cueva",
    label: "x20 Monedas",
  },
  {
    x: 3456,
    y: 1440,
    dinero: 30,
    bonus: { tipo: "daño", valor: 2 },
    zona: "cueva",
    label: "+2 Daño",
  },
  {
    x: 2336,
    y: 1472,
    dinero: 25,
    bonus: { tipo: "vida", valor: 8 },
    zona: "cueva",
    label: "+8 HP Máx",
  },
  {
    x: 2496,
    y: 1728,
    dinero: 35,
    bonus: { tipo: "defensa", valor: 2 },
    zona: "cueva",
    label: "+2 Defensa",
  },
  {
    x: 3104,
    y: 1920,
    dinero: 30,
    bonus: { tipo: "daño", valor: 4 },
    zona: "cueva",
    label: "+4 Daño",
  },
  {
    x: 640,
    y: 1984,
    dinero: 20,
    bonus: { tipo: "moneda", valor: 25 },
    zona: "cueva",
    label: "x25 Monedas",
  },
  {
    x: 832,
    y: 1984,
    dinero: 25,
    bonus: { tipo: "vida", valor: 10 },
    zona: "cueva",
    label: "+10 HP Máx",
  },
  {
    x: 2400,
    y: 2048,
    dinero: 50,
    bonus: { tipo: "daño", valor: 5 },
    zona: "cueva",
    label: "+5 Daño",
  },
];

const BONUS_COLOR = {
  vida: 0xff6688,
  daño: 0xff4400,
  defensa: 0x44aaff,
  moneda: 0xffd700,
};

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "Main" });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRELOAD
  // ════════════════════════════════════════════════════════════════════════════
  preload() {
    // ── 1. SISTEMA DE BARRA DE CARGA VISUAL ───────────────────────────────────
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    const barBg = this.add.rectangle(cx, cy, 300, 18, 0x111111).setDepth(1000);
    const bar = this.add
      .rectangle(cx - 149, cy, 2, 14, 0x44ff88)
      .setDepth(1001)
      .setOrigin(0, 0.5);
    const label = this.add
      .text(cx, cy - 20, "Cargando...", { fontSize: "12px", fill: "#aabbcc" })
      .setDepth(1001)
      .setOrigin(0.5);

    this.load.on("progress", (value) => {
      bar.width = Math.max(2, 298 * value);
      label.setText("Cargando... " + Math.floor(value * 100) + "%");
    });

    // Evita que un spritesheet con ruta incorrecta detenga toda la carga.
    // Los enemigos con textura faltante usarán el fallback 'enemy-slime' automáticamente.
    this.load.on("loaderror", (file) => {
      console.warn("[Preload] ⚠ No se pudo cargar:", file.key, "→", file.src);
    });

    this.load.on("complete", () => {
      barBg.destroy();
      bar.destroy();
      label.destroy();
    });

    // ── 2. CARGA DE MAPAS Y TILESETS ──────────────────────────────────────────
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
    this.load.image(
      "tileset_props1",
      "assets/tilemaps/Sprites/PixelFantasy_Caves_1.0/props1.png",
    );
    this.load.image("tileset_v1", "assets/tilemaps/Sprites/TileSet_V1.png");
    this.load.image("tileset_cofre", "assets/tilemaps/Sprites/cofre.png");
    this.load.image("tileset_nubes", "assets/tilemaps/Sprites/nubes.jpg");
    this.load.image(
      "tileset_trampas",
      "assets/tilemaps/Sprites/Trap and Weapon/00 All.png",
    );
    this.load.image(
      "tileset_crystal_cave",
      "assets/tilemaps/Sprites/crystal cave tiles.png",
    );

    // ── 3. SPRITESHEETS DEL JUGADOR (CABALLERO) ────────────────────────────────
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

    // ── 4. SPRITESHEETS DE ENEMIGOS ORIGINALES Y NUEVOS ───────────────────────
    this.load.spritesheet("enemy-slime", "assets/Enemigos/Slime_Green.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet(
      "enemy-murcielago",
      "assets/Enemigos/32x32-bat-sprite.png",
      { frameWidth: 32, frameHeight: 32 },
    );

    // Golem naranja: Golems_Free_Version/Golem_1/Orange/No_Swoosh_VFX/
    const GOLEM_BASE =
      "assets/Enemigos/Golems_Free_Version/Golems_Free_Version/Golem_1/Orange/No_Swoosh_VFX/";
    this.load.spritesheet("enemy-golem", GOLEM_BASE + "Golem_1_walk.png", {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet("enemy-golem-hurt", GOLEM_BASE + "Golem_1_hurt.png", {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet("enemy-golem-idle", GOLEM_BASE + "Golem_1_idle.png", {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "enemy-golem-atk",
      GOLEM_BASE + "Golem_1_attack.png",
      { frameWidth: 90, frameHeight: 64 },
    );
    this.load.spritesheet("enemy-golem-die", GOLEM_BASE + "Golem_1_die.png", {
      frameWidth: 90,
      frameHeight: 64,
    });

    // ── 5. ITEMS Y MISCELÁNEA ─────────────────────────────────────────────────
    this.load.spritesheet("coin", "assets/coin.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // ── 6. ARCHIVOS DE CONFIGURACIÓN DATA JSON ────────────────────────────────
    this.load.json("coinsData", "data/coins.json");
    this.load.json("jugadorData", "data/jugador.json");
    this.load.json("enemigosData", "data/enemigos.json");
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CREATE
  // ════════════════════════════════════════════════════════════════════════════
  create() {
    const jData = this.cache.json.get("jugadorData")?.jugador || {};
    const enemigosArr = this.cache.json.get("enemigosData")?.enemigos || [];
    const cData = this.cache.json.get("coinsData");

    const esNuevaPartida = this.registry.get("esNuevaPartida");
    const save = esNuevaPartida ? null : SaveManager.load();

    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);

    // ── Tilemap ──────────────────────────────────────────────────────────
    const map = this.make.tilemap({ key: "mapa_bosque" });
    const allTs = this._cargarTilesets(map);

    // ── Fondo parallax ───────────────────────────────────────────────────
    this._crearFondo(map);

    // ── Capas sin colisión ───────────────────────────────────────────────
    this.crearCapa(map, allTs, "Suelo 2");
    this.crearCapa(map, allTs, "Capa de patrones 1");
    this.crearCapa(map, allTs, "Cueva Profundidad 2");
    this.crearCapa(map, allTs, "Agua 2");
    this.crearCapa(map, allTs, "Cueva Profundidad");
    this.crearCapa(map, allTs, "Cueva profundidad negro");

    // ── Capas con colisión ───────────────────────────────────────────────
    this.groundLayer = this.crearCapa(map, allTs, "Suelo");
    if (this.groundLayer) this.groundLayer.setCollisionByExclusion([-1]);

    this.pared1Layer = this.crearCapa(map, allTs, "Pared 1");
    if (this.pared1Layer) this.pared1Layer.setCollisionByExclusion([-1]);

    this.pared2Layer = this.crearCapa(map, allTs, "Pared 2");
    if (this.pared2Layer) this.pared2Layer.setCollisionByExclusion([-1]);

    this.suelo3Layer = this.crearCapa(map, allTs, "Suelo 3");
    if (this.suelo3Layer) this.suelo3Layer.setCollisionByExclusion([-1]);

    // ── Capas decorativas ────────────────────────────────────────────────
    this.crearCapa(map, allTs, "Decoraciones");
    this.crearCapa(map, allTs, "Arbol");
    this.crearCapa(map, allTs, "Cofres");

    // ── Objetos ──────────────────────────────────────────────────────────
    this._crearCapasObjetos(map);

    // ── Texturas procedurales ────────────────────────────────────────────
    this._crearTexturasProcedurales();

    // ── Plataformas torre ────────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup();
    this._crearPlataformasTorre();

    // ── Animaciones ──────────────────────────────────────────────────────
    this._crearAnimaciones();

    // ── Jugador ──────────────────────────────────────────────────────────
    const spawnX = save?.posicionX ?? 200;
    const spawnY = save?.posicionY ?? 860;
    this.playerObj = new Player(this, spawnX, spawnY, jData);
    this.player = this.playerObj.sprite;

    if (save) this._restaurarGuardado(save);

    this._conectarColisionesJugador();
    this.player.play("knight-idle");

    // ── Validación de objetos ────────────────────────────────────────────
    this._validarObjetos();

    // ── Orbes de habilidad ───────────────────────────────────────────────
    this._crearOrbes();

    // ── Cofres ───────────────────────────────────────────────────────────
    this._crearCofres();

    // ── Enemigos ─────────────────────────────────────────────────────────
    this._crearEnemigos(enemigosArr);

    // ── Fireballs ────────────────────────────────────────────────────────
    this._crearSistemaFireball();

    // ── Monedas ──────────────────────────────────────────────────────────
    this._crearMonedas(cData);

    // ── Efectos ambientales ──────────────────────────────────────────────
    this._crearParticulasAmbientalesBosque();
    this._crearParticulasAmbientalesCueva();

    // ── HUD ──────────────────────────────────────────────────────────────
    this.score = save?.oro ?? jData.dinero ?? 0;
    this.hud = new Hud(this, this.player, this.score);
    this.hud.updateHpBar();
    this.hud.updateXpBar();

    if (this.player.canDoubleJump && this.hud.activarDobleSalto) this.hud.activarDobleSalto();
    if (this.player.canDash && this.hud.activarDash) this.hud.activarDash();

    // ── Controles ────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.swordKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z,
    );
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.dashKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT,
    );
    this.debugKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D,
    );
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.input.keyboard.enabled = true;

    // ── Cámara ───────────────────────────────────────────────────────────
    // FIX: setSize explícito para que la cámara ocupe todo el canvas,
    // especialmente necesario con Scale.FIT y ventanas redimensionables.
    this.cameras.main
      .setSize(this.scale.width, this.scale.height)
      .setBounds(0, 0, MAP_W, MAP_H)
      .setZoom(1.25)
      .startFollow(this.player, true, 0.08, 0.08);

    // ── Overlay viñeta cueva ─────────────────────────────────────────────
    this._crearVignetteAmbiente();

    // FIX: el listener de resize ahora también recentra la cámara y el HUD
    this.scale.on("resize", (gameSize) => {
      const { width, height } = gameSize;
      this.cameras.main.setSize(width, height);
      if (this.hud?.onResize) this.hud.onResize(gameSize);
      // Reescalar overlay
      if (this._cuevaOverlay) {
        this._cuevaOverlay.setSize(width, height);
      }
    });

    // ── Guardado automático ──────────────────────────────────────────────
    this._onGuardar = () => SaveManager.save(this.player, this.score);
    window.addEventListener("guardarPartida", this._onGuardar);
    this._autoSaveTimer = this.time.addEvent({
      delay: 30000,
      callback: () => {
        if (!this.player.isDead) SaveManager.save(this.player, this.score);
      },
      loop: true,
    });

    this.events.on("shutdown", () => {
      window.removeEventListener("guardarPartida", this._onGuardar);
      this.input.keyboard.removeAllKeys(true);
      if (this._autoSaveTimer) this._autoSaveTimer.remove();
    });

    this.fireCooldown = false;
    this._zonaActual = "bosque";
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VALIDACIÓN AUTOMÁTICA
  // ════════════════════════════════════════════════════════════════════════════

  _validarObjetos() {
    const enemigosArr = this.cache.json.get("enemigosData")?.enemigos || [];
    if (enemigosArr.length < 3) {
      console.warn(
        "[Validación] ⚠ Se esperaban 3 tipos de enemigos, hay:",
        enemigosArr.length,
      );
    }

    const texturasRequeridas = [
      "orbe-doble-salto",
      "orbe-dash",
      "cofre-tex",
      "cofre-abierto-tex",
      "fireball-texture",
      "orbe-halo",
    ];
    texturasRequeridas.forEach((key) => {
      if (!this.textures.exists(key)) {
        console.warn("[Validación] ⚠ Textura faltante:", key);
      }
    });

    console.log("[Validación] ✅ Orbe Doble Salto en:", ORBE_DOBLE_SALTO);
    console.log("[Validación] ✅ Orbe Dash en:", ORBE_DASH);
    console.log("[Validación] ✅ Cofres:", COFRES_DATA.length);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MÉTODOS DE CONSTRUCCIÓN
  // ════════════════════════════════════════════════════════════════════════════

  _cargarTilesets(map) {
    const ts = (n, k) => map.addTilesetImage(n, k) ?? null;
    return [
      ts("Pixel_Woods_Tileset", "tileset_pixel_woods"),
      ts("Dungeon", "tileset_dungeon"),
      ts("Nieve", "tileset_snow"),
      ts("Cueva", "tileset_cueva"),
      ts("TileSet_V1", "tileset_v1"),
      ts("cofre", "tileset_cofre"),
      ts("nubes", "tileset_nubes"),
      ts("props1", "tileset_props1"),
      ts("Trampas", "tileset_trampas"),
      ts("crystal cave tiles", "tileset_crystal_cave"),
    ].filter(Boolean);
  }

  _crearFondo(map) {
    const fondoLayer = map.getObjectLayer("Fondo");
    if (!fondoLayer) return;
    fondoLayer.objects.forEach((obj) => {
      const img = this.add
        .image(obj.x, obj.y, "tileset_nubes")
        .setDisplaySize(obj.width, obj.height)
        .setAlpha(0.6)
        .setDepth(-10)
        .setOrigin(0, 0);
      // sin setScrollFactor → se mueve 1:1 con la cámara, estático
      if (obj.rotation === 180 || obj.rotation === -180) {
        img.setPosition(obj.x - obj.width, obj.y);
        img.setFlip(true, true);
      }
    });
  }

  _crearCapasObjetos(map) {
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
        const frameKey = `${textureKey}__${localId}`;
        const texture = this.textures.get(textureKey);
        if (!texture) return;
        if (!texture.has(frameKey)) {
          texture.add(
            frameKey,
            0,
            (localId % cols) * tw,
            Math.floor(localId / cols) * th,
            tw,
            th,
          );
        }
        this.add
          .image(obj.x, obj.y, textureKey, frameKey)
          .setOrigin(0, 1)
          .setDisplaySize(obj.width, obj.height)
          .setDepth(2);
      });
    });
  }

  _crearTexturasProcedurales() {
    const mk = (fn, key, w, h) => {
      const g = this.make.graphics({ add: false });
      fn(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    mk(
      (g) => {
        g.fillStyle(0xff8800);
        g.fillCircle(7, 7, 7);
        g.fillStyle(0xffdd00);
        g.fillCircle(7, 7, 4);
        g.fillStyle(0xffffff);
        g.fillCircle(7, 7, 2);
      },
      "fireball-texture",
      14,
      14,
    );

    mk(
      (g) => {
        g.fillStyle(0x00ffaa, 0.25);
        g.fillCircle(16, 16, 16);
        g.fillStyle(0x00cc88, 1);
        g.fillCircle(16, 16, 11);
        g.fillStyle(0x00ffaa, 1);
        g.fillCircle(16, 16, 8);
        g.fillStyle(0x88ffdd, 0.6);
        g.fillCircle(12, 12, 5);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(11, 11, 2);
      },
      "orbe-doble-salto",
      32,
      32,
    );

    mk(
      (g) => {
        g.fillStyle(0x2255ff, 0.25);
        g.fillCircle(16, 16, 16);
        g.fillStyle(0x2244dd, 1);
        g.fillCircle(16, 16, 11);
        g.fillStyle(0x4488ff, 1);
        g.fillCircle(16, 16, 8);
        g.fillStyle(0x99ccff, 0.6);
        g.fillCircle(12, 12, 5);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(11, 11, 2);
      },
      "orbe-dash",
      32,
      32,
    );

    mk(
      (g) => {
        g.fillStyle(0x000000, 0.35);
        g.fillRect(2, 28, 28, 4);
        g.fillStyle(0x4a2200);
        g.fillRect(0, 10, 28, 18);
        g.fillStyle(0x7a4410);
        g.fillRect(0, 2, 28, 10);
        g.fillStyle(0xffd700);
        g.fillRect(0, 11, 28, 3);
        g.fillStyle(0x5a2800);
        g.fillRect(0, 15, 28, 2);
        g.fillStyle(0x5a2800);
        g.fillRect(0, 22, 28, 2);
        g.fillStyle(0xaa8800);
        g.fillRect(0, 10, 3, 18);
        g.fillStyle(0xaa8800);
        g.fillRect(25, 10, 3, 18);
        g.fillStyle(0xffd700);
        g.fillRect(11, 15, 6, 5);
        g.fillStyle(0x442200);
        g.fillRect(13, 17, 2, 3);
        g.fillStyle(0x442200);
        g.fillEllipse(14, 17, 4, 3);
        g.fillStyle(0xffd700);
        g.fillRect(1, 11, 2, 2);
        g.fillRect(25, 11, 2, 2);
        g.fillRect(1, 26, 2, 2);
        g.fillRect(25, 26, 2, 2);
        g.lineStyle(1, 0x221100, 1);
        g.strokeRect(0, 2, 28, 26);
      },
      "cofre-tex",
      28,
      32,
    );

    mk(
      (g) => {
        g.fillStyle(0x3a1800);
        g.fillRect(0, 16, 28, 14);
        g.fillStyle(0xffd700);
        g.fillRect(0, 17, 28, 2);
        g.fillStyle(0xaa8800);
        g.fillRect(0, 16, 3, 14);
        g.fillStyle(0xaa8800);
        g.fillRect(25, 16, 3, 14);
        g.fillStyle(0x7a4410);
        g.fillRect(0, 2, 28, 8);
        g.fillStyle(0xffd700);
        g.fillRect(0, 3, 28, 1);
        g.lineStyle(1, 0x221100, 1);
        g.strokeRect(0, 2, 28, 8);
        g.strokeRect(0, 16, 28, 14);
        g.fillStyle(0xffd700, 0.3);
        g.fillRect(4, 18, 20, 8);
      },
      "cofre-abierto-tex",
      28,
      32,
    );

    mk(
      (g) => {
        g.fillStyle(0xffffff, 0.07);
        g.fillCircle(24, 24, 24);
      },
      "orbe-halo",
      48,
      48,
    );

    mk(
      (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillCircle(3, 3, 3);
      },
      "particle-dot",
      6,
      6,
    );
  }

  _crearPlataformasTorre() {
    const cuboInicioX = 1650;
    const cuboY = 590;
    for (let i = 0; i < 5; i++) {
      const c = this.platforms.create(cuboInicioX + i * 32, cuboY, null);
      c.setVisible(false);
      c.setSize(32, 32);
      c.refreshBody();
    }
  }

  _crearAnimaciones() {
    const ka = (key, tex, s, e, fr, rep) =>
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(tex, { start: s, end: e }),
        frameRate: fr,
        repeat: rep ?? -1,
      });

    ka("knight-idle", "knight-idle", 0, 6, 8, -1);
    ka("knight-run", "knight-run", 0, 7, 12, -1);
    ka("knight-attack", "knight-attack", 0, 5, 16, 0);
    ka("knight-jump", "knight-jump", 0, 4, 10, 0);
    ka("knight-hurt", "knight-hurt", 0, 3, 10, 0);
    ka("knight-death", "knight-death", 0, 11, 10, 0);

    ka("slime-move", "enemy-slime", 20, 28, 10, -1);
    ka("slime-hurt", "enemy-slime", 36, 39, 10, 0);
    ka("bat-fly", "enemy-murcielago", 0, 7, 10, -1);
    ka("bat-hurt", "enemy-murcielago", 8, 11, 12, 0);

    ka("coin-spin", "coin", 0, 7, 10, -1);

    // ── Golem naranja – detección automática de frames ────────────────────
    // Cada PNG tiene su propio número de frames; los calculamos desde la textura
    // para no depender de valores hardcodeados incorrectos.
    const golemAnim = (animKey, texKey, frameRate, repeat) => {
      if (!this.textures.exists(texKey)) return;
      const tex = this.textures.get(texKey);
      // frameTotal incluye el frame base '__BASE', restamos 1 para obtener frames reales
      const totalFrames = Math.max(1, tex.frameTotal - 1);
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers(texKey, {
          start: 0,
          end: totalFrames - 1,
        }),
        frameRate,
        repeat,
      });
    };

    golemAnim("golem-move", "enemy-golem", 8, -1);
    golemAnim("golem-idle", "enemy-golem-idle", 6, -1);
    golemAnim("golem-hurt", "enemy-golem-hurt", 10, 0);
    golemAnim("golem-charge", "enemy-golem-atk", 10, 0);
    golemAnim("golem-die", "enemy-golem-die", 8, 0);
  }

  _restaurarGuardado(save) {
    const sp = this.player;
    sp.hp = save.vida ?? sp.hp;
    sp.hpMax = save.vidaMax ?? sp.hpMax;
    sp.xp = save.xp ?? sp.xp;
    sp.danioBase = save.danioBase ?? sp.danioBase;
    sp.defensa = save.defensa ?? sp.defensa;
    this.playerObj.recalcularNivel(save.nivel ?? sp.nivel);
    if (save.habilidades) this.playerObj.restaurarHabilidades(save.habilidades);
  }

  _conectarColisionesJugador() {
    if (this.groundLayer)
      this.physics.add.collider(this.player, this.groundLayer);
    if (this.pared1Layer)
      this.physics.add.collider(this.player, this.pared1Layer);
    if (this.pared2Layer)
      this.physics.add.collider(this.player, this.pared2Layer);
    if (this.suelo3Layer)
      this.physics.add.collider(this.player, this.suelo3Layer);
    this.physics.add.collider(this.player, this.platforms);
  }

  // ── Orbes ────────────────────────────────────────────────────────────────
  _crearOrbes() {
    this._orbeDobleSalto = this._crearOrbeHabilidad(
      ORBE_DOBLE_SALTO.x,
      ORBE_DOBLE_SALTO.y,
      "orbe-doble-salto",
      0x00ffaa,
      () => {
        if (this.playerObj.desbloquearDobleSalto()) {
          if (this.hud?.activarDobleSalto) this.hud.activarDobleSalto();
          SaveManager.save(this.player, this.score);
        }
      },
    );

    this._orbeDash = this._crearOrbeHabilidad(
      ORBE_DASH.x,
      ORBE_DASH.y,
      "orbe-dash",
      0x4488ff,
      () => {
        if (this.playerObj.desbloquearDash()) {
          if (this.hud?.activarDash) this.hud.activarDash();
          SaveManager.save(this.player, this.score);
        }
      },
    );

    if (!this._orbeDobleSalto)
      console.warn("[Orbes] ⚠ Orbe Doble Salto no se creó correctamente");
    if (!this._orbeDash)
      console.warn("[Orbes] ⚠ Orbe Dash no se creó correctamente");
  }

  _crearOrbeHabilidad(x, y, textureKey, color, onRecoger) {
    const grupo = this.physics.add.staticGroup();
    const orbe = grupo.create(x, y, textureKey);
    if (!orbe) {
      console.error(
        "[Orbe] Error al crear orbe con textura:",
        textureKey,
        "en",
        x,
        y,
      );
      return null;
    }
    orbe.body.setSize(30, 30);
    orbe.refreshBody();
    orbe.setDepth(15);

    const halo = this.add
      .image(x, y, "orbe-halo")
      .setTint(color)
      .setAlpha(0.5)
      .setDepth(14);

    this.tweens.add({
      targets: [orbe, halo],
      y: y - 10,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: orbe,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: "Quad.easeInOut",
    });
    this.tweens.add({
      targets: halo,
      alpha: 0.12,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this._spawnParticlesAscendentes(x, y, color);

    this.physics.add.overlap(this.player, grupo, (_p, o) => {
      if (o.recogido) return;
      o.recogido = true;
      halo.destroy();
      onRecoger();

      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        const p = this.add
          .circle(o.x + Math.cos(ang) * 8, o.y + Math.sin(ang) * 8, 3, color, 1)
          .setDepth(310);
        this.tweens.add({
          targets: p,
          x: o.x + Math.cos(ang) * 60,
          y: o.y + Math.sin(ang) * 60,
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 650,
          delay: i * 18,
          ease: "Power2",
          onComplete: () => p.destroy(),
        });
      }

      const ring = this.add.circle(o.x, o.y, 5, color, 0.7).setDepth(309);
      this.tweens.add({
        targets: ring,
        radius: 75,
        alpha: 0,
        duration: 750,
        ease: "Power2",
        onComplete: () => ring.destroy(),
      });
      this.tweens.add({
        targets: o,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 380,
        ease: "Back.easeIn",
        onComplete: () => o.destroy(),
      });
    });

    return { grupo, orbe };
  }

  _spawnParticlesAscendentes(x, y, color) {
    const spawnOne = () => {
      if (!this.scene.isActive("Main")) return;
      const px = x + Phaser.Math.Between(-14, 14);
      const py = y + Phaser.Math.Between(-5, 12);
      const p = this.add
        .circle(px, py, Phaser.Math.Between(1, 3), color, 0.8)
        .setDepth(16);
      this.tweens.add({
        targets: p,
        y: py - Phaser.Math.Between(28, 55),
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: Phaser.Math.Between(650, 1250),
        ease: "Power1",
        onComplete: () => {
          p.destroy();
          spawnOne();
        },
      });
    };
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 260, spawnOne);
  }

  _crearParticulasAmbientalesBosque() {
    const spawnHoja = () => {
      const x = Phaser.Math.Between(0, 3520);
      const y = Phaser.Math.Between(0, 960);
      const hoja = this.add
        .circle(x, y, Phaser.Math.Between(1, 2), 0x88ee44, 0.5)
        .setDepth(3);
      this.tweens.add({
        targets: hoja,
        x: x + Phaser.Math.Between(-30, 30),
        y: y + Phaser.Math.Between(40, 90),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        ease: "Sine.easeInOut",
        onComplete: () => hoja.destroy(),
      });
    };
    this.time.addEvent({
      delay: 300,
      callback: () => {
        if (this.player && this.player.y < 960) spawnHoja();
      },
      loop: true,
    });

    const spawnLuz = () => {
      const cx = this.player?.x ?? 400;
      const cy = this.player?.y ?? 500;
      if (cy > 960) return;
      const x = cx + Phaser.Math.Between(-200, 200);
      const y = cy + Phaser.Math.Between(-120, 120);
      const p = this.add.circle(x, y, 2, 0xffffff, 0.6).setDepth(4);
      this.tweens.add({
        targets: p,
        y: y - Phaser.Math.Between(20, 45),
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: Phaser.Math.Between(1200, 2400),
        ease: "Power1",
        onComplete: () => p.destroy(),
      });
    };
    this.time.addEvent({ delay: 180, callback: spawnLuz, loop: true });
  }

  _crearParticulasAmbientalesCueva() {
    const spawnPolvo = () => {
      const cx = this.player?.x ?? 400;
      const cy = this.player?.y ?? 1400;
      if (cy < 960) return;
      const x = cx + Phaser.Math.Between(-180, 180);
      const y = cy + Phaser.Math.Between(-100, 100);
      const p = this.add.circle(x, y, 1, 0x8899cc, 0.4).setDepth(4);
      this.tweens.add({
        targets: p,
        y: y + Phaser.Math.Between(15, 35),
        alpha: 0,
        duration: Phaser.Math.Between(1800, 3200),
        ease: "Sine.easeInOut",
        onComplete: () => p.destroy(),
      });
    };
    this.time.addEvent({ delay: 220, callback: spawnPolvo, loop: true });

    const spawnCristal = () => {
      const cx = this.player?.x ?? 400;
      const cy = this.player?.y ?? 1400;
      if (cy < 960) return;
      const x = cx + Phaser.Math.Between(-250, 250);
      const y = cy + Phaser.Math.Between(-150, 150);
      const p = this.add
        .circle(x, y, Phaser.Math.Between(1, 3), 0x44aaff, 0.7)
        .setDepth(4);
      this.tweens.add({
        targets: p,
        alpha: 0.1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: Phaser.Math.Between(800, 1600),
        yoyo: true,
        repeat: 1,
        onComplete: () => p.destroy(),
      });
    };
    this.time.addEvent({ delay: 400, callback: spawnCristal, loop: true });
  }

  _crearCofres() {
    this.cofresTotal = { bosque: 0, cueva: 0 };
    this.cofresAbiertos = { bosque: 0, cueva: 0 };

    COFRES_DATA.forEach((d) => {
      this.cofresTotal[d.zona] = (this.cofresTotal[d.zona] || 0) + 1;
    });

    this.cofresGroup = this.physics.add.staticGroup();

    COFRES_DATA.forEach((datos) => {
      const cofre = this.cofresGroup.create(datos.x, datos.y, "cofre-tex");
      cofre.body.setSize(28, 26);
      cofre.refreshBody();

      // Hacemos que el cofre sea invisible en el mapa
      cofre.setVisible(false);

      cofre.dinero = datos.dinero;
      cofre.zona = datos.zona;
      cofre.bonus = datos.bonus;
      cofre.label = datos.label;
      cofre.abierto = false;
      cofre.setDepth(12);

      // Eliminamos el efecto 'glow' (brillo) para que no delate su posición
    });

    this.physics.add.overlap(this.player, this.cofresGroup, (_p, cofre) => {
      if (!cofre.abierto) this._abrirCofre(cofre);
    });
  }

  _abrirCofre(cofre) {
    cofre.abierto = true;
    cofre.setTexture("cofre-abierto-tex");
    cofre.setTint(0xfff0aa);

    this.score += cofre.dinero;

    if (cofre.bonus) {
      const { tipo, valor } = cofre.bonus;
      if (tipo === "vida") {
        this.player.hpMax += valor;
        this.player.hp = Math.min(this.player.hp + valor, this.player.hpMax);
      }
      if (tipo === "daño") {
        this.player.danioBase += valor;
      }
      if (tipo === "defensa") {
        this.player.defensa += valor;
      }
      if (tipo === "moneda") {
        this.score += valor;
      }
    }

    if (cofre.zona) {
      this.cofresAbiertos[cofre.zona] =
        (this.cofresAbiertos[cofre.zona] || 0) + 1;
    }

    // ── Actualizar HUD ──────────────────────────────────────────────────
    this.hud.setScore(this.score);
    this.hud.updateHpBar();
    this.hud.updateXpBar();

    // Animación de partículas puras en las coordenadas del mapa
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const c = this.add
        .circle(cofre.x, cofre.y - 8, 4, 0xffd700, 1)
        .setDepth(220);
      this.tweens.add({
        targets: c,
        x: cofre.x + Math.cos(ang) * 42,
        y: cofre.y + Math.sin(ang) * 42 - 22,
        alpha: 0,
        scaleX: 0.4,
        scaleY: 0.4,
        duration: 650,
        delay: i * 28,
        ease: "Power2",
        onComplete: () => c.destroy(),
      });
    }

    const burst = this.add
      .circle(cofre.x, cofre.y, 6, 0xffd700, 0.65)
      .setDepth(219);
    this.tweens.add({
      targets: burst,
      radius: 45,
      alpha: 0,
      duration: 420,
      ease: "Power2",
      onComplete: () => burst.destroy(),
    });

    if (this.spawnDamageText)
      this.spawnDamageText(cofre.x, cofre.y - 32, cofre.dinero, "#ffd700");

    this.cameras.main.shake(60, 0.002);
    this.tweens.add({ targets: cofre, alpha: 0.3, duration: 700, delay: 250 });
  }

  _crearEnemigos(enemigosArr) {
    this.enemies = this.physics.add.group();

    // ── Helper: busca datos y hace spawn con Y exacta ─────────────────────
    const get = (nombre) => enemigosArr.find((e) => e.nombre === nombre);
    const spawnE = (nombre, x, y) => {
      const eData = get(nombre);
      if (eData) Enemy.spawn(this, x, { ...eData, spawnY: y });
    };

    // ════════════════════════════════════════════════════════════════════
    // BOSQUE – Slimes
    // Plataformas suelo principal: Y ≈ 832
    // ════════════════════════════════════════════════════════════════════

    // Suelo principal del bosque (izquierda → derecha)
    const slimesSuelo = [
      180, 420, 680, 870, 1050, 1124, 1480, 1680, 1870, 2048, 2280, 2648, 2780,
      3020, 3260, 3440,
    ];
    slimesSuelo.forEach((x) => spawnE("slime", x, 820));

    // ════════════════════════════════════════════════════════════════════
    // CUEVA – Murciélagos y Golems
    // La cueva empieza en Y ≈ 1056 (tile 33 × 32).
    // Plataformas escalonadas visibles en el mapa: Y ≈ 1090–1700
    // ════════════════════════════════════════════════════════════════════

    // Murciélagos – vuelan, se colocan en zonas abiertas (zona media-alta cueva)
    // allowGravity=false así que el Y es exactamente donde aparecen
    const murcielagosPosiciones = [
      { x: 64,   y: 1504 },
      { x: 256,  y: 1248 },
      { x: 448,  y: 2080 },
      { x: 544,  y: 1824 },
      { x: 736,  y: 2080 },
      { x: 928,  y: 2080 },
      { x: 1120, y: 1824 },
      { x: 1312, y: 1952 },
      { x: 1408, y: 1760 },
      { x: 1696, y: 1824 },
      { x: 1888, y: 1568 },
      { x: 1984, y: 1568 },
      { x: 2272, y: 1632 },
      { x: 2368, y: 1248 },
      { x: 2464, y: 1248 },
      { x: 2656, y: 1440 },
      { x: 2848, y: 1760 },
      { x: 3040, y: 1568 },
      { x: 3328, y: 1952 },
      { x: 3424, y: 1952 },
    ];
    murcielagosPosiciones.forEach(({ x, y }) => spawnE("murcielago", x, y));

    // Golems – lentos, en zonas amplias y profundas de la cueva
    // Pocos pero estratégicamente colocados (no meter muchos = más impacto)
    const golemsPosiciones = [
      { x: 284,  y: 1650 }, // corregido: estaba en muro (380,1650)
      { x: 868,  y: 1700 }, // corregido: estaba en muro (900,1700)
      { x: 1440, y: 1680 }, // corregido: estaba en muro (1600,1680)
      { x: 2400, y: 1720 },
      { x: 3196, y: 1660 }, // corregido: estaba en muro (3100,1660)
    ];
    golemsPosiciones.forEach(({ x, y }) => spawnE("golem", x, y));

    // ── Colisiones ────────────────────────────────────────────────────────
    if (this.groundLayer)
      this.physics.add.collider(this.enemies, this.groundLayer);
    if (this.pared1Layer)
      this.physics.add.collider(this.enemies, this.pared1Layer);
    if (this.pared2Layer)
      this.physics.add.collider(this.enemies, this.pared2Layer);
    if (this.suelo3Layer)
      this.physics.add.collider(this.enemies, this.suelo3Layer);
    this.physics.add.collider(this.enemies, this.platforms);

    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      if (!this.player.invincible && enemy.active && !this.player.isDead) {
        this.playerObj.hit(enemy);
      }
    });
  }

  _crearSistemaFireball() {
    this.fireballs = this.physics.add.group();

    this.physics.add.overlap(this.fireballs, this.enemies, (fb, enemy) => {
      if (fb.active) {
        this._fxImpactoFireball(fb.x, fb.y);
        fb.destroy();
      }
      this.hitEnemy(enemy);
    });

    const stopFb = (fb) => {
      if (fb.active) {
        this._fxImpactoFireball(fb.x, fb.y);
        fb.destroy();
      }
    };
    if (this.groundLayer)
      this.physics.add.collider(this.fireballs, this.groundLayer, stopFb);
    if (this.pared1Layer)
      this.physics.add.collider(this.fireballs, this.pared1Layer, stopFb);
    this.physics.add.collider(this.fireballs, this.platforms, stopFb);
  }

  _fxImpactoFireball(x, y) {
    for (let i = 0; i < 7; i++) {
      const ang = Math.random() * Math.PI * 2;
      const p = this.add
        .circle(x, y, Phaser.Math.Between(2, 4), 0xff8800, 1)
        .setDepth(250);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * 22,
        y: y + Math.sin(ang) * 22,
        alpha: 0,
        duration: 280,
        onComplete: () => p.destroy(),
      });
    }
    const flash = this.add.circle(x, y, 8, 0xffff00, 0.8).setDepth(251);
    this.tweens.add({
      targets: flash,
      radius: 16,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy(),
    });
  }

  _crearMonedas(cData) {
    this.coins = this.physics.add.group();
    if (cData?.coins) {
      cData.coins.forEach((pos) => {
        const c = this.coins.create(pos.x, pos.y, "coin");
        c.body.allowGravity = false;
        c.play("coin-spin");
        c.setDepth(12);
      });
    }

    this.physics.add.overlap(this.player, this.coins, (_p, coin) => {
      coin.destroy();
      this.score += 1;
      this.hud.setScore(this.score);
      const flash = this.add
        .circle(coin.x, coin.y, 6, 0xffd700, 0.7)
        .setDepth(200);
      this.tweens.add({
        targets: flash,
        radius: 14,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy(),
      });
    });
  }

  _crearVignetteAmbiente() {
    // FIX: usar las dimensiones reales del canvas, no valores fijos.
    this._cuevaOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000820, 0)
      .setScrollFactor(0)
      .setDepth(496)
      .setOrigin(0);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════════════════════

  crearCapa(map, tilesets, nombre) {
    try {
      const layer = map.createLayer(nombre, tilesets, 0, 0);
      if (!layer) {
        console.warn(`[Tilemap] Capa "${nombre}" no encontrada.`);
        return null;
      }
      return layer;
    } catch (e) {
      console.warn(`[Tilemap] Error al crear capa "${nombre}":`, e.message);
      return null;
    }
  }

  updateHpBar() {
    this.hud?.updateHpBar();
  }
  updateXpBar() {
    this.hud?.updateXpBar();
  }

  spawnDamageText(x, y, amount, color) {
    if (amount <= 0) return;
    const isPositive = color === "#ffd700" || color === "#00ff88";
    const t = this.add
      .text(x, y, (isPositive ? "+" : "-") + amount, {
        fontSize: "15px",
        fontStyle: "bold",
        fill: color || "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(300);

    const dx = Phaser.Math.Between(-20, 20);
    this.tweens.add({
      targets: t,
      x: t.x + dx,
      y: t.y - 52,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 1000,
      ease: "Power2",
      onComplete: () => t.destroy(),
    });
  }

  hitEnemy(enemy) {
    if (!enemy?.active) return;

    const danoFinal = Math.max(
      1,
      this.player.danioBase - Math.floor((enemy.defensa || 0) * 0.5),
    );
    const danoAplicado = Math.min(danoFinal, enemy.hp);
    enemy.hp -= danoAplicado;

    this.spawnDamageText(enemy.x, enemy.y - 18, danoAplicado, "#ffffff");
    if (enemy.updateHpBar) enemy.updateHpBar();

    enemy.setTint(0xff2222);
    this.time.delayedCall(190, () => {
      if (enemy.active) enemy.clearTint();
    });
    this.cameras.main.shake(45, 0.003);

    if (enemy.hp <= 0) {
      if (Math.random() < (enemy.dropProb ?? 1)) {
        this.score += enemy.moneyDrop;
        this.hud.setScore(this.score);
        this._fxMuerteEnemigo(enemy.x, enemy.y, enemy.moneyDrop);
      }
      // Golem: animación de muerte + terremoto final
      if (enemy.tipo === "golem") {
        this._fxTerremoto(enemy.x, enemy.y, true);
        if (this.anims.exists("golem-die")) {
          enemy.play("golem-die", true);
          enemy.once("animationcomplete", () => {
            this.player.xp += enemy.xpReward;
            this.checkLevelUp();
            enemy.destroy();
          });
          return;
        }
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
    } catch (e) {
      console.log(e);
    }

    // El golem no recibe knockback por su masa
    if (enemy.tipo !== "golem") {
      enemy.setVelocityY(-140);
      enemy.setVelocityX(enemy.x > this.player.x ? 100 : -100);
    }
  }

  // ── Terremoto del Golem ──────────────────────────────────────────────────
  _fxTerremoto(x, y, isDeath = false) {
    const radio = isDeath ? 180 : 120;
    const sp = this.player;

    // Sacudida fuerte de cámara
    this.cameras.main.shake(isDeath ? 350 : 200, isDeath ? 0.018 : 0.01);

    // Onda de choque en el suelo
    for (let i = 0; i < (isDeath ? 16 : 10); i++) {
      const ang = (i / (isDeath ? 16 : 10)) * Math.PI * 2;
      const rock = this.add
        .circle(
          x + Math.cos(ang) * 10,
          y + Math.sin(ang) * 10,
          Phaser.Math.Between(3, 7),
          isDeath ? 0xff6600 : 0x886644,
          1,
        )
        .setDepth(280);
      this.tweens.add({
        targets: rock,
        x: x + Math.cos(ang) * Phaser.Math.Between(30, radio),
        y: y + Math.sin(ang) * Phaser.Math.Between(20, radio * 0.5),
        alpha: 0,
        duration: isDeath ? 700 : 450,
        delay: i * 20,
        ease: "Power2",
        onComplete: () => rock.destroy(),
      });
    }

    // Anillo de polvo en suelo
    const ring = this.add.circle(x, y + 16, 6, 0xaa8866, 0.7).setDepth(279);
    this.tweens.add({
      targets: ring,
      radius: radio * 0.8,
      alpha: 0,
      duration: isDeath ? 800 : 500,
      ease: "Power2",
      onComplete: () => ring.destroy(),
    });

    // Daño al jugador si está cerca
    const dist = Phaser.Math.Distance.Between(sp.x, sp.y, x, y);
    if (dist < radio && !sp.invincible && !sp.isDead) {
      const dmg = isDeath ? 8 : 5;
      this.playerObj.hit({ danioAtaque: dmg, x });
      // Knockback extra hacia arriba
      sp.setVelocityY(-320);
    }
  }

  _fxMuerteEnemigo(x, y, monedas) {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const c = this.add.circle(x, y, 3, 0xffd700, 1).setDepth(220);
      this.tweens.add({
        targets: c,
        x: x + Math.cos(ang) * 28,
        y: y + Math.sin(ang) * 28 - 12,
        alpha: 0,
        duration: 380,
        onComplete: () => c.destroy(),
      });
    }
    this.spawnDamageText(x, y - 22, monedas, "#ffd700");
  }

  shootFireball() {
    if (this.fireCooldown || this.player.isDead) return;
    this.fireCooldown = true;
    const dir = this.player.flipX ? -1 : 1;
    const fb = this.fireballs.create(
      this.player.x + dir * 24,
      this.player.y - 12,
      "fireball-texture",
    );
    if (!fb) return;
    fb.body.allowGravity = false;
    fb.setVelocityX(dir * 520);
    fb.setDepth(200);
    this.time.delayedCall(2000, () => {
      if (fb?.active) fb.destroy();
    });
    this.time.delayedCall(310, () => (this.fireCooldown = false));
  }

  checkLevelUp() {
    const p = this.player;
    if (p.xp >= p.xpSiguienteNivel) {
      const subio = this.playerObj.subirNivel();
      if (subio) {
        const msg = this.add
          .text(p.x, p.y - 45, "⬆ LEVEL UP  Nv." + p.nivel, {
            fontSize: "19px",
            fill: "#ffdd00",
            stroke: "#000",
            strokeThickness: 4,
            fontStyle: "bold",
          })
          .setDepth(300);
        this.tweens.add({
          targets: msg,
          y: "-=75",
          alpha: 0,
          duration: 1800,
          onComplete: () => msg.destroy(),
        });
      }
    }
    this.updateXpBar();
    this.updateHpBar();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // UPDATE
  update(_time, delta) {
    const sp = this.player;
    if (!sp || sp.isDead) return;

    this.playerObj.updateMovementTimers(delta);

    const onGround = sp.body.blocked.down;

    if (onGround) {
      this.playerObj.procesarJumpBuffer();
    }

    if (Phaser.Input.Keyboard.JustDown(this.dashKey)) {
      this.playerObj.intentarDash();
    }

    if (!sp.isDashing) {
      if (this.cursors.left.isDown) {
        this.playerObj.moverHorizontal(-1);
        if (onGround && !sp.isAttacking) sp.play("knight-run", true);
      } else if (this.cursors.right.isDown) {
        this.playerObj.moverHorizontal(1);
        if (onGround && !sp.isAttacking) sp.play("knight-run", true);
      } else {
        this.playerObj.moverHorizontal(0);
        if (onGround && !sp.isAttacking) sp.play("knight-idle", true);
      }
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space)
    ) {
      this.playerObj.intentarSaltar();
    }

    if (
      !onGround &&
      !sp.isAttacking &&
      !sp.isDashing &&
      sp.anims.currentAnim?.key !== "knight-jump" &&
      sp.anims.currentAnim?.key !== "knight-hurt"
    ) {
      if (sp.body.velocity.y > 80) sp.play("knight-jump", true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.swordKey) && !sp.isAttacking) {
      sp.isAttacking = true;
      sp.play("knight-attack", true);

      const dir = sp.flipX ? -1 : 1;
      const enemigosCerca = this.enemies
        .getChildren()
        .filter(
          (enemy) =>
            enemy.active &&
            Math.abs(enemy.x - sp.x) < 78 &&
            Math.abs(enemy.y - sp.y) < 52 &&
            ((dir > 0 && enemy.x >= sp.x - 22) ||
              (dir < 0 && enemy.x <= sp.x + 22)),
        );
      enemigosCerca.forEach((enemy) => this.hitEnemy(enemy));
      this._fxSlash(sp.x + dir * 32, sp.y - 5, dir);
      sp.once("animationcomplete", () => (sp.isAttacking = false));
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) this.shootFireball();

    if (Phaser.Input.Keyboard.JustDown(this.saveKey)) {
      SaveManager.save(this.player, this.score);
      if (this.hud && this.hud.mostrarToast) {
        this.hud.mostrarToast("💾 Partida guardada", 0x00ff88);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      const en = !this.physics.world.drawDebug;
      this.physics.world.drawDebug = en;
      if (en) {
        this.physics.world.debugGraphic?.clear();
        this.physics.world.createDebugGraphic();
      } else {
        this.physics.world.debugGraphic?.clear();
        this.physics.world.debugGraphic?.destroy();
        this.physics.world.debugGraphic = null;
      }
    }

    this.enemies.getChildren().forEach((enemy) => {
      Enemy.updateAI(enemy, sp, delta);
      if (enemy.updateHpBar) enemy.updateHpBar();

      // ── Golem: procesar terremoto cuando la IA lo dispara ───────────────
      if (enemy.tipo === "golem" && enemy.doQuake) {
        enemy.doQuake = false;
        this._fxTerremoto(enemy.x, enemy.y, false);
        // Animación de carga si existe
        if (this.anims.exists("golem-charge")) {
          enemy.play("golem-charge", true);
          enemy.once("animationcomplete", () => {
            if (enemy.active && this.anims.exists("golem-move"))
              enemy.play("golem-move", true);
          });
        }
      }

    });

    this.playerObj.updateShadow();

    if (this._cuevaOverlay) {
      const targetAlpha = sp.y > 960 ? 0.2 : 0;
      this._cuevaOverlay.alpha = Phaser.Math.Linear(
        this._cuevaOverlay.alpha,
        targetAlpha,
        0.04,
      );
    }

    // Actualización reactiva de zona (Sin llamadas rotas de clases externas)
    const zonaActual = sp.y < 960 ? "bosque" : "cueva";
    if (zonaActual !== this._zonaActual) {
      this._zonaActual = zonaActual;
    }
  }

  _fxSlash(x, y, dir) {
    const g = this.add.graphics().setDepth(290);
    g.lineStyle(3, 0xffffff, 0.9);
    g.arc(x - dir * 10, y, 30, -0.8, 0.8, dir < 0);
    g.strokePath();
    this.tweens.add({
      targets: g,
      alpha: 0,
      duration: 130,
      onComplete: () => g.destroy(),
    });

    for (let i = 0; i < 4; i++) {
      const p = this.add
        .circle(
          x + dir * Phaser.Math.Between(-5, 15),
          y + Phaser.Math.Between(-10, 10),
          2,
          0xffffff,
          0.9,
        )
        .setDepth(291);
      this.tweens.add({
        targets: p,
        x: p.x + dir * 18,
        alpha: 0,
        duration: 150,
        delay: i * 20,
        onComplete: () => p.destroy(),
      });
    }
  }
}