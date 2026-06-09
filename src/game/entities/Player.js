// ── Player.js – Metroidvania Professional Edition ────────────────────────────
// Movimiento fluido con Coyote Time, Jump Buffer, aceleración suave y dash mejorado.

import * as Phaser from "phaser";

export default class Player {
  constructor(scene, x, y, jData) {
    this.scene = scene;
    this.nivelesData = jData?.niveles || [];

    this.sprite = scene.physics.add.sprite(x, y, "knight-idle");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(30, 22);
    this.sprite.body.setOffset(33, 22);

    // ── Stats base ────────────────────────────────────────────────────────
    this.sprite.hpMax = jData?.vida || 75;
    this.sprite.hp = this.sprite.hpMax;
    this.sprite.danioBase = jData?.danio || 5;
    this.sprite.defensa = jData?.defensa || 1;
    this.sprite.xp = jData?.xp || 0;
    this.sprite.nivel = jData?.nivel || 1;
    this.sprite.xpSiguienteNivel = this.xpParaNivel(this.sprite.nivel + 1);

    // ── Flags de estado ───────────────────────────────────────────────────
    this.sprite.invincible = false;
    this.sprite.isDead = false;
    this.sprite.isAttacking = false;

    // ── Sistema Metroidvania ──────────────────────────────────────────────
    this.sprite.canDoubleJump = false;
    this.sprite.canDash = false;
    this.sprite.jumpsLeft = 1;
    this.sprite.isDashing = false;
    this.sprite.dashCooldown = false;
    this.sprite.dashDuration = 180;
    this.sprite.dashSpeed = 440;
    this.sprite.dashCooldownMs = 680;

    // ── Movimiento avanzado ───────────────────────────────────────────────
    this._runSpeed = 210;
    this._accelGround = 0.2; // interpolación en suelo
    this._accelAir = 0.09; // interpolación en aire (control suave)
    this._decelGround = 0.15;
    this._jumpForce = -530;
    this._doubleJumpForce = -410;

    // Coyote Time: tiempo tras caer un borde donde todavía puedes saltar
    this._coyoteTime = 100; // ms
    this._coyoteTimer = 0;
    this._wasOnGround = false;

    // Jump Buffer: si pulsas salto justo antes de tocar suelo, se ejecuta
    this._jumpBufferTime = 120; // ms
    this._jumpBuffer = 0;

    // ── Sombra proyectada ─────────────────────────────────────────────────
    this._shadowGfx = scene.add
      .ellipse(x, y + 18, 22, 6, 0x000000, 0.3)
      .setDepth(1);
  }

  xpParaNivel(nivel) {
    const e = this.nivelesData.find((n) => n.nivel === nivel);
    return e?.xp_req ?? 99999;
  }

  recalcularNivel(nivelGuardado) {
    this.sprite.nivel = nivelGuardado;
    this.sprite.xpSiguienteNivel = this.xpParaNivel(nivelGuardado + 1);
  }

  subirNivel() {
    const sp = this.sprite;
    const prev = sp.nivel;
    sp.nivel += 1;
    sp.xp = 0;
    sp.xpSiguienteNivel = this.xpParaNivel(sp.nivel + 1);

    const bonus = this.nivelesData.find((n) => n.nivel === sp.nivel);
    if (bonus) {
      sp.hpMax += bonus.vida_bonus || 0;
      sp.danioBase += bonus.danio_bonus || 0;
      if (bonus.defensa != null) sp.defensa = bonus.defensa;
    }
    sp.hp = sp.hpMax;
    this._fxLevelUp();
    return prev !== sp.nivel;
  }

  _fxLevelUp() {
    const sp = this.sprite;
    sp.setTint(0xffd700);
    this.scene.time.delayedCall(400, () => {
      if (sp.active) sp.clearTint();
    });

    // Onda expansiva
    const ring = this.scene.add
      .circle(sp.x, sp.y, 5, 0xffd700, 0.7)
      .setDepth(300);
    this.scene.tweens.add({
      targets: ring,
      radius: 70,
      alpha: 0,
      duration: 700,
      ease: "Power2",
      onComplete: () => ring.destroy(),
    });

    // Estrellas orbitales
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const star = this.scene.add
        .text(sp.x + Math.cos(angle) * 18, sp.y + Math.sin(angle) * 18, "✦", {
          fontSize: "11px",
          fill: "#ffd700",
          stroke: "#000",
          strokeThickness: 2,
        })
        .setDepth(300)
        .setOrigin(0.5);
      this.scene.tweens.add({
        targets: star,
        x: star.x + Math.cos(angle) * 55,
        y: star.y + Math.sin(angle) * 55 - 20,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 750,
        delay: i * 35,
        ease: "Power2",
        onComplete: () => star.destroy(),
      });
    }
  }

  desbloquearDobleSalto() {
    if (this.sprite.canDoubleJump) return false;
    this.sprite.canDoubleJump = true;
    this._fxDesbloqueo(0x00ffaa);
    return true;
  }

  desbloquearDash() {
    if (this.sprite.canDash) return false;
    this.sprite.canDash = true;
    this._fxDesbloqueo(0x4488ff);
    return true;
  }

  _fxDesbloqueo(color) {
    const sp = this.sprite;
    const ring = this.scene.add.circle(sp.x, sp.y, 5, color, 0.6).setDepth(300);
    this.scene.tweens.add({
      targets: ring,
      radius: 65,
      alpha: 0,
      duration: 650,
      ease: "Power2",
      onComplete: () => ring.destroy(),
    });
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const particle = this.scene.add
        .circle(
          sp.x + Math.cos(ang) * 12,
          sp.y + Math.sin(ang) * 12,
          3,
          color,
          1,
        )
        .setDepth(301);
      this.scene.tweens.add({
        targets: particle,
        x: sp.x + Math.cos(ang) * 60,
        y: sp.y + Math.sin(ang) * 60,
        alpha: 0,
        duration: 520,
        delay: i * 18,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }
  }

  // ── Actualización de timers de movimiento (llamar en update) ───────────────
  updateMovementTimers(delta) {
    const sp = this.sprite;
    const onGround = sp.body.blocked.down;

    // Coyote Time
    if (onGround) {
      this._coyoteTimer = this._coyoteTime;
      this._wasOnGround = true;
    } else {
      if (this._coyoteTimer > 0) this._coyoteTimer -= delta;
    }

    // Jump Buffer
    if (this._jumpBuffer > 0) this._jumpBuffer -= delta;
  }

  // ── Intento de saltar con Jump Buffer y Coyote Time ──────────────────────
  intentarSaltar() {
    const sp = this.sprite;
    if (sp.isDead || sp.isDashing) return false;

    const onGround = sp.body.blocked.down;
    const canCoyote = this._coyoteTimer > 0 && !onGround;

    // ── Fuerza de salto según zona ────────────────────────────────────────
    const enCueva = sp.y > 960;
    const jumpForce = enCueva ? -700 : this._jumpForce;
    const doubleJumpForce = enCueva ? -560 : this._doubleJumpForce;

    if (onGround || canCoyote) {
      sp.setVelocityY(jumpForce);
      sp.play("knight-jump", true);
      sp.jumpsLeft = sp.canDoubleJump ? 1 : 0;
      this._coyoteTimer = 0;
      this._jumpBuffer = 0;
      this._wasOnGround = false;
      return true;
    } else if (sp.canDoubleJump && sp.jumpsLeft > 0) {
      sp.setVelocityY(doubleJumpForce);
      sp.play("knight-jump", true);
      sp.jumpsLeft = 0;
      this._jumpBuffer = 0;
      this._fxDoubleJump();
      return true;
    } else {
      this._jumpBuffer = this._jumpBufferTime;
      return false;
    }
  }
  // Procesar jump buffer cuando toca suelo
  procesarJumpBuffer() {
    if (this._jumpBuffer > 0) {
      this._jumpBuffer = 0;
      return this.intentarSaltar();
    }
    return false;
  }

  _fxDoubleJump() {
    const sp = this.sprite;
    for (let i = 0; i < 8; i++) {
      const ang = Math.PI + (i / 8) * Math.PI;
      const p = this.scene.add
        .circle(sp.x + Math.cos(ang) * 12, sp.y + 12, 3, 0x00ffaa, 0.9)
        .setDepth(299);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(ang) * 28,
        y: p.y + 14,
        alpha: 0,
        duration: 380,
        delay: i * 25,
        onComplete: () => p.destroy(),
      });
    }
    // Destello breve
    sp.setTint(0xffffff);
    this.scene.time.delayedCall(120, () => {
      if (sp.active) sp.clearTint();
    });
  }

  intentarDash() {
    const sp = this.sprite;
    if (!sp.canDash) return false;
    if (sp.isDashing || sp.dashCooldown || sp.isDead) return false;

    sp.isDashing = true;
    sp.dashCooldown = true;
    sp.invincible = true;

    const dir = sp.flipX ? -1 : 1;
    sp.setVelocityX(sp.dashSpeed * dir);
    sp.setVelocityY(0);
    sp.body.allowGravity = false;

    sp.setTint(0x88ccff);
    this._spawnDashTrail(dir);

    this.scene.time.delayedCall(sp.dashDuration, () => {
      if (!sp.active) return;
      sp.isDashing = false;
      sp.body.allowGravity = true;
      sp.clearTint();
      sp.invincible = false;
    });

    this.scene.time.delayedCall(sp.dashDuration + sp.dashCooldownMs, () => {
      sp.dashCooldown = false;
    });

    return true;
  }

  _spawnDashTrail(dir) {
    const sp = this.sprite;
    for (let i = 0; i < 7; i++) {
      this.scene.time.delayedCall(i * 22, () => {
        if (!sp.active) return;
        const ghost = this.scene.add.sprite(
          sp.x - dir * i * 15,
          sp.y,
          sp.texture.key,
          sp.frame.name,
        );
        ghost.setAlpha(0.4 - i * 0.05);
        ghost.setTint(0x4488ff);
        ghost.setFlipX(sp.flipX);
        ghost.setDepth(sp.depth - 1);
        ghost.setScale(sp.scaleX, sp.scaleY);
        this.scene.tweens.add({
          targets: ghost,
          alpha: 0,
          duration: 280,
          onComplete: () => ghost.destroy(),
        });
      });
    }
  }

  // ── Movimiento horizontal con aceleración suave ────────────────────────────
  moverHorizontal(direccion) {
    const sp = this.sprite;
    if (sp.isDashing || sp.isDead) return;

    const onGround = sp.body.blocked.down;
    const lerp = onGround ? this._accelGround : this._accelAir;

    if (direccion !== 0) {
      const targetVX = this._runSpeed * direccion;
      const newVX = Phaser.Math.Linear(sp.body.velocity.x, targetVX, lerp);
      sp.setVelocityX(newVX);
      sp.flipX = direccion < 0;
    } else {
      // Deceleración suave
      const decel = onGround ? this._decelGround : this._accelAir * 0.6;
      const newVX = Phaser.Math.Linear(sp.body.velocity.x, 0, decel);
      sp.setVelocityX(Math.abs(newVX) < 4 ? 0 : newVX);
    }
  }

  hit(enemy) {
    const sp = this.sprite;
    const scene = this.scene;
    if (sp.invincible || sp.isDead) return;

    const danoBase = enemy.danioAtaque || 5;
    const reduccion = Math.floor(sp.defensa * 0.5);
    const danoFinal = Math.max(1, danoBase - reduccion);
    sp.hp = Math.max(0, sp.hp - danoFinal);

    scene.spawnDamageText(sp.x, sp.y - 30, danoFinal, "#ff4455");
    scene.updateHpBar();
    scene.cameras.main.shake(90, 0.005);

    if (sp.hp <= 0) {
      sp.isDead = true;
      sp.play("knight-death", true);
      this._onDeath();
      return;
    }

    sp.invincible = true;
    sp.play("knight-hurt", true);
    sp.setVelocity((sp.x > enemy.x ? 1 : -1) * 270, -200);

    scene.tweens.add({
      targets: sp,
      alpha: 0.25,
      duration: 70,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        sp.alpha = 1;
        sp.invincible = false;
      },
    });
  }

  _onDeath() {
    const sp = this.sprite;
    sp.setTint(0xaa2222);
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const p = this.scene.add
        .circle(
          sp.x + Math.cos(ang) * 8,
          sp.y + Math.sin(ang) * 8,
          3,
          0xff2244,
          1,
        )
        .setDepth(302);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(ang) * 45,
        y: p.y + Math.sin(ang) * 45 - 30,
        alpha: 0,
        duration: 650,
        delay: i * 35,
        onComplete: () => p.destroy(),
      });
    }
  }

  updateShadow() {
    if (!this._shadowGfx || !this.sprite.active) return;
    const sp = this.sprite;
    this._shadowGfx.setPosition(sp.x, sp.y + 18);
    const onGround = sp.body.blocked.down;
    this._shadowGfx.setScale(1, onGround ? 1 : 0.45);
    this._shadowGfx.setAlpha(onGround ? 0.3 : 0.12);
  }

  restaurarHabilidades(habilidades = {}) {
    if (habilidades.dobleSalto) this.sprite.canDoubleJump = true;
    if (habilidades.dash) this.sprite.canDash = true;
  }
}
