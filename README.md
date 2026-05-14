# Proyecto Metroidvania

Juego de plataformas hecho con React, Vite y Phaser 3 para clase.

---

## Requisitos

- Node.js v18 o superior
- pnpm

---

## Instalación y arranque

```bash
pnpm install
pnpm run dev
```

Luego abre `http://localhost:5173` en el navegador.

---

## Estructura

```
src/
├── Pantallas/        # Cada pantalla del juego (inicio, menú, juego, pausa, opciones)
├── Componentes/      # Componentes reutilizables (ventana de guardar)
├── scenes/           # Escenas de Phaser (MainScene.js)
├── entities/         # Lógica de jugador y enemigos
└── App.jsx           # Gestiona qué pantalla se muestra

public/
├── assets/           # Sprites y fondos
└── data/             # JSON con stats del jugador, enemigos y posición de monedas
```

---

## Controles

| Tecla | Qué hace |
|-------|----------|
| `←` `→` | Moverse |
| `↑` o `Espacio` | Saltar |
| `Z` | Atacar con espada |
| `X` | Lanzar bola de fuego |
| `ESC` | Pausar |

---

## Enemigos

- **Slime** — patrulla el suelo y persigue al jugador si se acerca
- **Murciélago** — vuela y persigue en todas direcciones
- **Planta saltarina** — salta periódicamente y persigue si detecta al jugador

Todos tienen barra de vida visible encima.

---

## Progresión

Matar enemigos da XP y oro. Al subir de nivel se recupera todo el HP y mejoran las stats. Las monedas del mapa también se pueden recoger.

---

## Guardado

La partida se guarda en el navegador (localStorage). Guarda posición, vida, nivel, XP y oro.

- Pausar → *Guardar* para guardar sin salir
- Al intentar salir sin guardar aparece una ventana de confirmación
- En el menú principal → *Continuar* carga la última partida

---

## Scripts

```bash
pnpm run dev      # desarrollo
pnpm run build    # compilar para producción
pnpm run preview  # previsualizar el build
```
