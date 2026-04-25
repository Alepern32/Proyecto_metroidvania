# Proyecto Metroidvania

Este proyecto consiste en el desarrollo de un videojuego tipo metroidvania utilizando React para la interfaz.

## Parte realizada

En esta parte del proyecto se ha trabajado principalmente en la integración entre el menú, el juego y los datos del jugador.

## Funcionalidades implementadas

- Menú principal con opciones de empezar partida, continuar, opciones y salir
- Sistema de pausa dentro del juego
- Sistema de guardado de partida en el navegador (localStorage)
- Sistema de carga de partida desde el navegador
- HUD que muestra datos reales del jugador (vida, oro y nivel)

## Integración

Se ha conseguido conectar las distintas partes del proyecto:

- El menú permite iniciar una nueva partida o continuar una existente
- Los datos del jugador se guardan correctamente
- Al continuar partida se cargan los datos guardados
- La HUD muestra los datos del jugador en tiempo real

## Archivos principales

- `App.jsx`: controla las pantallas y los datos del jugador
- `MenuPrincipal.jsx`: menú principal del juego
- `Juego.jsx`: pantalla del juego con HUD
- `MenuPausa.jsx`: menú de pausa
- `VentanaGuardar.jsx`: ventana para guardar antes de salir

## Rama

Trabajo realizado en la rama:

mapa_guisell

## Nota

El objetivo principal ha sido la integración de las distintas partes del proyecto, siguiendo las indicaciones del tutor.
