// ── Enemy.js – Sistema de Enemigos Profesional ───────────────────────────────

import { updateAI } from '../ai/EnemyAI';
import HpBar from '../ui/HpBar';

export default class Enemy {

  static spawn(scene, x, eData) {
    if (!eData) return null;

    const nombre = eData.nombre;
    const texKey = 'enemy-' + nombre.replace(/ /g, '_');
    const texValida = scene.textures.exists(texKey) && scene.textures.get(texKey).frameTotal > 1;
    const textureKey = texValida ? texKey : 'enemy-slime';
    const fallback = textureKey === 'enemy-slime';

    const spawnY = eData.spawnY ?? 800;
    const enemy = scene.enemies.create(x, spawnY, textureKey);
    if (!enemy) return null;

    enemy.setCollideWorldBounds(true);

    // ── Hitbox y gravedad por tipo ────────────────────────────────────────
    if (nombre === 'slime') {
      enemy.body.setSize(20, 14);
      enemy.body.setOffset(6, 0);
    } else if (nombre === 'murcielago') {
      enemy.body.setSize(24, 16);
      enemy.body.setOffset(4, 8);
      enemy.body.allowGravity = false;
    } else if (nombre === 'golem') {
      // Golem es grande: usa frameWidth 64, escalamos el sprite
      enemy.setScale(1.5);
      enemy.body.setSize(40, 52);
      enemy.body.setOffset(12, 8);
    } else {
      enemy.body.setSize(20, 20);
    }

    // ── Stats ─────────────────────────────────────────────────────────────
    enemy.tipo = nombre;
    enemy.hp = eData.estadisticas?.vida || 20;
    enemy.hpMax = enemy.hp;
    enemy.danioAtaque = eData.estadisticas?.danio || 5;
    enemy.defensa = eData.estadisticas?.defensa || 1;
    enemy.velocidad = eData.estadisticas?.velocidad || 60;
    enemy.xpReward = eData.estadisticas?.experiencia || 10;
    enemy.moneyDrop = eData.drop?.dinero || 5;
    enemy.dropProb = eData.drop?.probabilidad ?? 1;

    if (nombre === 'golem') {
      enemy.isCharging = false;
      enemy.chargeElapsed = 0;
      enemy.doQuake = false;
      enemy.quakeTimer = 0;
      enemy.roarTimer = 0;
    }

    enemy.dir = Math.random() > 0.5 ? 1 : -1;
    enemy.patrolTimer = 0;
    enemy.jumpTimer = 0;
    enemy.chaseDist = nombre === 'murcielago' ? 260
      : nombre === 'golem' ? 320
        : 190;

    // ── Sombra proyectada (solo enemigos terrestres) ──────────────────────
    if (nombre !== 'murcielago') {
      const shadowW = nombre === 'golem' ? 34 : 18;
      enemy._shadow = scene.add
        .ellipse(x, 800 + 16, shadowW, 6, 0x000000, 0.25)
        .setDepth(1);
    }

    // ── Barra de vida flotante ─────────────────────────────────────────────
    const barWidth = nombre === 'golem' ? 48 : 30;
    const hpBar = new HpBar(scene, { width: barWidth, height: 4, offsetY: nombre === 'golem' ? -40 : -24 });

    enemy.updateHpBar = () => {
      if (!enemy.active) return;
      const pct = Math.max(0, enemy.hp / enemy.hpMax);
      hpBar.update(enemy.x, enemy.y, pct);
      if (enemy._shadow) {
        enemy._shadow.setPosition(enemy.x, enemy.y + (nombre === 'golem' ? 28 : 16));
        enemy._shadow.setAlpha(enemy.body.blocked.down ? 0.25 : 0.10);
      }
    };

    const origDestroy = enemy.destroy.bind(enemy);
    enemy.destroy = () => {
      hpBar.destroy();
      if (enemy._shadow) enemy._shadow.destroy();
      origDestroy();
    };

    if (fallback) enemy.tipo = 'slime';
    const animKey = fallback ? 'slime-move' : Enemy.animMove(nombre);
    if (scene.anims.exists(animKey)) enemy.play(animKey);

    return enemy;
  }

  static animMove(nombre) {
    if (nombre === 'slime') return 'slime-move';
    if (nombre === 'murcielago') return 'bat-fly';
    if (nombre === 'golem') return 'golem-move';
    return 'slime-move';
  }

  static animHurt(nombre) {
    if (nombre === 'slime') return 'slime-hurt';
    if (nombre === 'murcielago') return 'bat-hurt';
    if (nombre === 'golem') return 'golem-hurt';
    return 'slime-hurt';
  }

  static updateAI(enemy, player, delta) {
    updateAI(enemy, player, delta);
  }
}