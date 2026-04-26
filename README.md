# Persistencia de datos

La rama `persistencia-datos` añade un sistema de guardado y carga de partida usando `localStorage`. No hay base de datos ni servidor — todo vive en el navegador del jugador.

---

## Por qué localStorage

Phaser no tiene sistema de guardado propio. Las opciones eran cookies, `sessionStorage` o `localStorage`. Se eligió `localStorage` porque los datos sobreviven al cerrar el navegador, no tienen fecha de expiración y no se envían al servidor en cada petición como las cookies.

El único límite relevante es que solo guarda strings, por eso el objeto de estado se serializa con `JSON.stringify` al escribir y se parsea con `JSON.parse` al leer.

---

## Qué se guarda

Solo el estado mínimo necesario para reanudar la partida donde se dejó:

| Campo | Descripción |
|-------|-------------|
| `vida` | HP actual del jugador en el momento de guardar |
| `vidaMax` | HP máximo (puede haber subido por niveles) |
| `oro` | Monedas acumuladas |
| `nivel` | Nivel actual |
| `xp` | XP acumulada dentro del nivel actual |
| `posicionX` | Coordenada X del jugador en el mapa |
| `posicionY` | Coordenada Y del jugador en el mapa |

Los enemigos y las monedas no se guardan — se regeneran igual que en una partida nueva. Solo el jugador conserva su progreso.

---

## Cómo se guarda

El problema principal de integrar React con Phaser es que son dos mundos separados: React gestiona la UI y Phaser gestiona el juego. No pueden llamarse directamente sin acoplarse de forma frágil.

La solución usada es un evento de `window`. React lanza la señal y Phaser la recoge desde dentro de la escena, donde tiene acceso directo a todos los datos del jugador.

Cuando el jugador pulsa *Guardar* en el menú de pausa, `App.jsx` hace:

```js
window.dispatchEvent(new Event("guardarPartida"));
```

`MainScene.js` registra un listener al final de `create()` que responde a ese evento:

```js
this._onGuardar = () => {
  const estado = {
    vida:      this.player.hp,
    vidaMax:   this.player.hpMax,
    oro:       this.score,
    nivel:     this.player.nivel,
    xp:        this.player.xp,
    posicionX: Math.round(this.player.x),
    posicionY: Math.round(this.player.y),
  };
  localStorage.setItem("partidaGuardada", JSON.stringify(estado));
};
window.addEventListener("guardarPartida", this._onGuardar);
```

Las coordenadas se redondean con `Math.round` para evitar decimales innecesarios en el JSON.

El listener se elimina cuando Phaser destruye la escena. Si no se hiciera, el listener quedaría activo en `window` aunque el juego ya no esté corriendo, y el siguiente evento de guardado podría intentar acceder a objetos destruidos:

```js
this.events.on("shutdown", () => {
  window.removeEventListener("guardarPartida", this._onGuardar);
});
```

---

## Cuándo se puede guardar

Hay tres momentos en los que se activa el guardado:

- **Botón *Guardar*** en el menú de pausa — guarda y vuelve al juego
- **Botón *Guardar y salir*** en la ventana de confirmación — guarda y vuelve al menú principal
- **Implícitamente** al pulsar *Salir al menú* si la partida ya estaba marcada como guardada

Si el jugador intenta salir al menú sin haber guardado, aparece una ventana de confirmación con tres opciones: guardar y salir, salir sin guardar, o cancelar.

---

## Dónde se almacena

En el `localStorage` del navegador bajo la clave `partidaGuardada`. Se puede inspeccionar en cualquier momento desde las DevTools del navegador: pestaña *Application* → *Local Storage* → dominio del juego.

Ejemplo de lo que queda escrito:

```json
{
  "vida": 60,
  "vidaMax": 100,
  "oro": 14,
  "nivel": 3,
  "xp": 45,
  "posicionX": 312,
  "posicionY": 390
}
```

Solo hay una ranura de guardado. Guardar de nuevo sobreescribe la partida anterior.

---

## Cómo se carga

Al pulsar *Continuar* en el menú principal, `App.jsx` comprueba si existe la clave en `localStorage`. Si no existe, avisa al jugador. Si existe, cambia la pantalla a `"juego"` sin hacer nada más con los datos.

```js
function continuarPartida() {
  const raw = localStorage.getItem("partidaGuardada");
  if (raw) {
    setPantallaActual("juego");
  } else {
    alert("No hay ninguna partida guardada");
  }
}
```

Cuando Phaser monta la escena, `MainScene.create()` lee el JSON y lo aplica antes de crear al jugador. Si no hay guardado, usa los valores por defecto de `jugador.json`:

```js
const raw  = localStorage.getItem("partidaGuardada");
const save = raw ? JSON.parse(raw) : null;

const spawnX = save?.posicionX ?? 50;
const spawnY = save?.posicionY ?? 280;
this.playerObj = new Player(this, spawnX, spawnY, jData);

if (save) {
  this.player.hp    = save.vida    ?? this.player.hp;
  this.player.hpMax = save.vidaMax ?? this.player.hpMax;
  this.player.nivel = save.nivel   ?? this.player.nivel;
  this.player.xp    = save.xp      ?? this.player.xp;
}

this.score = save?.oro ?? jData.dinero ?? 0;
```

El operador `??` (nullish coalescing) asegura que si un campo concreto falta en el JSON guardado, se use el valor por defecto en lugar de fallar.

---

## Flujo completo

```
Jugador pulsa "Guardar"
  → App.jsx: window.dispatchEvent("guardarPartida")
    → MainScene._onGuardar() captura el evento
      → lee this.player y this.score
        → localStorage.setItem("partidaGuardada", JSON)

Jugador pulsa "Continuar" en el menú
  → App.jsx: comprueba localStorage
    → cambia pantalla a "juego"
      → Phaser arranca MainScene
        → create() lee localStorage
          → aplica los datos al jugador antes de que empiece el bucle
```

---

## Limitaciones conocidas

- Solo hay una ranura de guardado. Guardar sobreescribe la partida anterior sin confirmación.
- Los enemigos y monedas no se persisten, se regeneran siempre igual.
- Si el jugador borra los datos del navegador o usa el modo incógnito, la partida se pierde.
- `localStorage` tiene un límite de unos 5MB por dominio, aunque el JSON de este juego ocupa menos de 1KB.

---

## Borrar la partida guardada

Desde la consola del navegador (F12):

```js
localStorage.removeItem("partidaGuardada");
```
