# Análisis del repositorio RacerJS

*Fecha: 2026-07-04 — rama `variableStages`*

## Qué es

**RacerJS** es un juego de carreras pseudo-3D estilo OutRun/retro, escrito en JavaScript vainilla con módulos ES, sin framework ni bundler (la única dependencia es Prettier). Renderiza a 320×240 en un canvas 2D oculto y luego pasa cada frame como textura a un canvas WebGL que aplica un shader de dithering Bayer 4×4 (`src/shaders/shaders.js`), dando el look de paleta reducida. Corre a 60fps con `setInterval` y tiene controles de teclado y táctiles (touch-pad para móvil).

## Arquitectura

- `src/racer.js` (441 líneas) — punto de entrada: setup del WebGL, bucle de render, splash screen, timer/game over, HUD y la mecánica de stages/checkpoints.
- `src/generateRoad.js` — generación procedural de la pista: máquinas de estados para alturas y curvas (transiciones senoidales por zona) y colocación de sprites según la fase (casas, torres, palmeras, cactus, túnel…).
- `src/stages.js` — descriptor de las 8 fases con colores (fondo, hierba, carretera, borde, carril), índices de transición y `roadParam` (longitud, curvatura, etc.). Los colores se interpolan entre fases con `interpolateObjects`.
- `src/gameElements.js` — coordenadas del spritesheet y estado del jugador.
- `src/draw/`, `src/physics/`, `src/controllers/`, `src/audio/` — primitivas de dibujo, física del coche, controles, y sonido de motor con Web Audio (la música de fondo está desactivada).

## Estado actual: rama `variableStages` (trabajo a medias)

Hay 4 archivos modificados sin commitear. El objetivo (según el backlog: *"fases irregulares de longitud, zoneSection en generateRoad"*) es que las fases tengan longitud variable. Lo que se ha hecho: `getZoneSections()` ahora devuelve un array hardcodeado `[600, 1000, 2000, ... 7000]` y en `racer.js` la fase actual se calcula con `findIndex` sobre ese array en vez de dividir por un tamaño fijo.

**El problema es que está desincronizado con la generación de la pista:**

1. `src/generateRoad.js:106` sigue generando con `roadParam.zoneSection` fijo (2000) × 15 zonas = 30.000 segmentos. Los sprites de cada fase (casas, torres, palmeras…) cambian cada 2000 segmentos, pero los colores y checkpoints en `racer.js` cambian en 600, 1000, 2000… No coinciden.
2. Los `zoneSections` solo llegan hasta 7000 pero la pista mide 30.000: a partir del segmento 7000, `findIndex` devuelve **-1**, así que `currentStagePos = -1`, `stages[-1]` es `undefined` y cae al fallback `stages[0]` — el resto de la carrera se ve con los colores de la fase 0 y los checkpoints dejan de funcionar.
3. Los `startIndex`/`endIndex` de transición en `src/stages.js` están hardcodeados y ya no derivan de `zoneSection` (el TODO de la línea 1 lo reconoce).

## Otros problemas detectados

- **Fuga de memoria WebGL**: `src/racer.js:394` crea una textura nueva con `gl.createTexture()` en *cada frame* sin borrar la anterior. Debería crearse una vez en el init y solo hacer `texImage2D` por frame.
- **Trabajo redundante en el bucle de profundidad**: toda la lógica de stages (llamada a `getStages`, interpolación de colores, y un `drawString` de "comarca") está *dentro* del `while (iter--)` que itera 150 veces por frame (`src/racer.js:241-286`). Se recalcula lo mismo 150 veces y probablemente sea la causa del `TODO: check why throw errors`. Debería estar fuera del bucle (salvo el alternado de color por segmento).
- `src/generateRoad.js:214` muta `roadParam.length` (15 → 30.000) como efecto colateral; si `generateRoad` se llamara dos veces, explotaría.
- El timer resta 16.67ms fijos por frame (`src/racer.js:370`) en vez del delta real, así que el tiempo se desvía si el frame rate baja.
- `console.log('zoneSection', ...)` cada frame en el bucle de render, y los logs de debug de `generateRoad`.
- Incoherencia: `player.maxSpeed` inicial es 40 pero `resetPlayer` lo pone a 20 — la primera partida es el doble de rápida que las siguientes.
- `BONUS_TIME = 0` pero el mensaje dice "Extended Time! +5s".
- Duplicados: `interpolateObjects` e `interpolateObject` en `src/utils.js` son idénticas; `keys` se exporta tanto de `src/racer.js` como de `src/controllers/gameControls.js` (solo se usa la del controlador).
- Archivos `.DS_Store` sin ignorar (aparecen como untracked; convendría añadirlos a `.gitignore`).

## Sugerencia para cerrar la rama

Lo natural sería hacer que `generateRoad` consuma los mismos `zoneSections` que usa el render: iterar sobre el array de fases (cada una con su longitud) en vez de `roadParam.length × zoneSection` fijo, y derivar `startIndex`/`endIndex` de los límites acumulados. Así sprites, colores y checkpoints quedarían sincronizados con una sola fuente de verdad.
