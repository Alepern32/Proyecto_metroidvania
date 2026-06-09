// ── EnemyAI.js – IA Enemigos Mejorada ────────────────────────────────────────
// Comportamientos fluidos con línea de visión, transiciones suaves y bordes.

import * as Phaser from "phaser";

export function updateAI(enemy, player, delta) {
  if (!enemy.active) return;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  if (enemy.tipo === "slime") {
    const inRange = ady < 52 && adx < enemy.chaseDist;

    if (inRange) {
      const dir = dx > 0 ? 1 : -1;
      const targetVX = enemy.velocidad * dir;
      enemy.setVelocityX(
        Phaser.Math.Linear(enemy.body.velocity.x, targetVX, 0.14),
      );
      enemy.setFlipX(dir > 0);
    } else {
      enemy.patrolTimer += delta;
      if (enemy.patrolTimer > 2200) {
        enemy.dir *= -1;
        enemy.patrolTimer = 0;
      }
      const targetVX = enemy.velocidad * 0.4 * enemy.dir;
      enemy.setVelocityX(
        Phaser.Math.Linear(enemy.body.velocity.x, targetVX, 0.11),
      );
      enemy.setFlipX(enemy.dir > 0);
    }

    if (enemy.body.blocked.left && enemy.dir < 0) {
      enemy.dir = 1;
      enemy.patrolTimer = 0;
    }
    if (enemy.body.blocked.right && enemy.dir > 0) {
      enemy.dir = -1;
      enemy.patrolTimer = 0;
    }
  } else if (enemy.tipo === "murcielago") {
    if (adx < enemy.chaseDist) {
      const dirX = dx > 0 ? 1 : -1;
      const dirY = dy > 0 ? 1 : -1;
      enemy.setVelocityX(
        Phaser.Math.Linear(enemy.body.velocity.x, enemy.velocidad * dirX, 0.09),
      );
      enemy.setVelocityY(
        Phaser.Math.Linear(
          enemy.body.velocity.y,
          enemy.velocidad * 0.58 * dirY,
          0.09,
        ),
      );
      enemy.setFlipX(dirX > 0);
    } else {
      enemy.patrolTimer += delta;
      if (enemy.patrolTimer > 1800) {
        enemy.dir *= -1;
        enemy.patrolTimer = 0;
      }
      const vx = enemy.velocidad * 0.3 * enemy.dir;
      const vy = Math.sin(enemy.patrolTimer * 0.0026) * 40;
      enemy.setVelocityX(Phaser.Math.Linear(enemy.body.velocity.x, vx, 0.08));
      enemy.setVelocityY(Phaser.Math.Linear(enemy.body.velocity.y, vy, 0.08));
    }
  } else if (enemy.tipo === "planta saltarina") {
    enemy.jumpTimer += delta;
    const onGround = enemy.body.blocked.down;

    if (adx < enemy.chaseDist && ady < 220) {
      const dir = dx > 0 ? 1 : -1;
      const targetVX = enemy.velocidad * 0.5 * dir;
      enemy.setVelocityX(
        Phaser.Math.Linear(enemy.body.velocity.x, targetVX, 0.11),
      );
      enemy.setFlipX(dir > 0);
      if (onGround && enemy.jumpTimer > 1050) {
        const jumpForce = -490 - Math.min(adx * 0.28, 130);
        enemy.setVelocityY(jumpForce);
        enemy.jumpTimer = 0;
      }
    } else {
      enemy.patrolTimer += delta;
      if (enemy.patrolTimer > 2500) {
        enemy.dir *= -1;
        enemy.patrolTimer = 0;
      }
      enemy.setVelocityX(
        Phaser.Math.Linear(
          enemy.body.velocity.x,
          enemy.velocidad * 0.3 * enemy.dir,
          0.09,
        ),
      );
      if (onGround && enemy.jumpTimer > 2100) {
        enemy.setVelocityY(-380);
        enemy.jumpTimer = 0;
      }
      if (enemy.body.blocked.left && enemy.dir < 0) {
        enemy.dir = 1;
        enemy.patrolTimer = 0;
      }
      if (enemy.body.blocked.right && enemy.dir > 0) {
        enemy.dir = -1;
        enemy.patrolTimer = 0;
      }
    }
  } else if (enemy.tipo === "golem") {
    enemy.quakeTimer = (enemy.quakeTimer || 0) + delta;
    enemy.roarTimer = (enemy.roarTimer || 0) + delta;

    const inRange = ady < 100 && adx < enemy.chaseDist;

    if (enemy.roarTimer > 4000) {
      enemy.roarTimer = 0;
      enemy.isCharging = true;
      enemy.doQuake = true;
    }

    if (inRange) {
      const dir = dx > 0 ? 1 : -1;
      const speed = enemy.isCharging
        ? enemy.velocidad * 1.8
        : enemy.velocidad * 0.6;
      const targetVX = speed * dir;
      enemy.setVelocityX(
        Phaser.Math.Linear(enemy.body.velocity.x, targetVX, 0.07),
      );
      enemy.setFlipX(dir > 0);

      if (enemy.isCharging) {
        enemy.chargeElapsed = (enemy.chargeElapsed || 0) + delta;
        if (enemy.chargeElapsed > 600) {
          enemy.isCharging = false;
          enemy.chargeElapsed = 0;
        }
      }
    } else {
      enemy.patrolTimer += delta;
      if (enemy.patrolTimer > 3500) {
        enemy.dir *= -1;
        enemy.patrolTimer = 0;
      }
      const targetVX = enemy.velocidad * 0.25 * enemy.dir;
      enemy.setVelocityX(
        Phaser.Math.Linear(enemy.body.velocity.x, targetVX, 0.06),
      );
      enemy.setFlipX(enemy.dir > 0);
    }

    if (enemy.body.blocked.left && enemy.dir < 0) {
      enemy.dir = 1;
      enemy.patrolTimer = 0;
    }
    if (enemy.body.blocked.right && enemy.dir > 0) {
      enemy.dir = -1;
      enemy.patrolTimer = 0;
    }
  }
}