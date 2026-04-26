# Proyecto_metroidvania

# Instrucciones para ejecutar el proyecto

## Requisitos
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior)

## Pasos

### 1. Descomprime el proyecto
Extrae el ZIP en la carpeta que quieras.

### 2. Abre una terminal en la carpeta del proyecto
Haz clic derecho dentro de la carpeta y selecciona **"Abrir en terminal"** o **"Git Bash"**.

### 3. Instala las dependencias
```bash
npm install
```
Esto descarga automáticamente todo lo necesario, incluyendo Phaser y React.

### 4. Arranca el juego
```bash
npm run dev
```

### 5. Abre el navegador
Ve a la dirección que aparece en la terminal, normalmente:
```
http://localhost:5173
```

---

## Notas importantes
- Si algo falla, prueba a borrar `node_modules/` y ejecutar `npm install` de nuevo


## Estructura del proyecto

```
/
├── config.js                  # Configuración principal de Phaser
├── scenes/
│   └── MainScene.js           # Escena principal del juego
├── entities/
│   ├── Player.js              # Lógica del jugador (caballero)
│   └── Enemy.js               # Lógica de enemigos (slime, murciélago, planta)
└── data/
    ├── jugador.json           # Stats base del jugador y tabla de niveles
    ├── enemigos.json          # Definiciones de enemigos (vida, daño, drop...)
    └── coins.json             # Posiciones de monedas en el mapa
```

---

## Archivos principales

### `config.js`
Configuración de arranque de Phaser 3. Define tamaño del canvas (640×480), motor de física arcade con gravedad, y registra `MainScene` como escena activa.

### `MainScene.js`
Escena principal que orquesta todo el juego:
- **`preload()`** — Carga spritesheets, imágenes y archivos JSON.
- **`create()`** — Construye plataformas, animaciones, jugador, enemigos, monedas y HUD.
- **`update()`** — Bucle de juego: controles del jugador, IA de enemigos y colisiones.

### `Player.js`
Clase que encapsula el sprite del caballero y su lógica de combate:
- Stats (HP, daño, defensa, XP, nivel) leídos desde `jugador.json`.
- Método `hit()` para recibir daño con invencibilidad temporal.
- Método `subirNivel()` que aplica bonificaciones de `jugador.json`.

### `Enemy.js`
Clase estática con tres responsabilidades:
- **`spawn()`** — Crea un enemigo en la escena con stats y barra de vida.
- **`updateAI()`** — Comportamiento de patrulla/persecución según tipo (slime, murciélago, planta saltarina).
- **`animMove/animHurt()`** — Devuelve la clave de animación correcta por tipo.

---

## Archivos JSON (`/data`)

| Archivo | Contenido |
|---|---|
| `jugador.json` | Vida, daño, defensa, XP inicial, nivel y tabla de bonificaciones por nivel |
| `enemigos.json` | Array de enemigos con nombre, estadísticas y probabilidad/cantidad de drop |
| `coins.json` | Array de posiciones `{x, y}` donde aparecen monedas en el mapa |

---

## Controles

| Tecla | Acción |
|---|---|
| ← → | Mover al caballero |
| ↑ / Espacio | Saltar |
| Z | Ataque de espada (radio 70px) |
| X | Lanzar bola de fuego |



