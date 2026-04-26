# CLAUDE.md
# RacerJS — Contexto del proyecto

  ## Stack
  - JavaScript ES modules, sin framework.
  - Render: canvas 2D (`#c`) compuesto sobre WebGL (`#canvasGL`)
   que aplica shader fullscreen.
  - Resolución interna fija 320x240, escalada por `resize.js`.
  - Loop a 60fps vía `setInterval(renderGameFrame, 1000/60)`.

  ## Estructura clave
  - `src/racer.js` — bootstrap, render loop, composición
  canvas→WebGL, HUD, FX de cámara.
  - `src/physics/carPhysics.js` — modelo de coche (longitudinal
  + lateral).
  - `src/gameElements.js` — estado de `player`, `render`,
  sprites.
  - `src/controllers/gameControls.js` — teclado (flechas +
  32=space, 68=D debug) y touchpad.
  - `src/generateRoad.js` — `road[]`, `roadSegmentSize=5`,
  `roadParam`.
  - `src/npc.js` — coches NPC.
  - `src/audio/engineSound.js` — pitch motor según
  `speed/maxSpeed`.
  - `src/shaders/shaders.js` — vsSource/fsSource para post.
  - `src/stages.js` — fases con colores e índices de carretera.

  ## Modelo de coche actual
  Posición longitudinal: `player.position += player.speed`.
  Posición lateral: `player.posx` con velocidad lateral
  `player.vx`.

  ### Aceleración (no lineal)
  ```js
  const accel = 0.05 * (1 - speedRatio) + 0.008;
  player.speed += accel;
  Punch off line, easing al tope.

  Frenado (proporcional a velocidad)

  const brake = 0.35 + player.speed * 0.05;

  Giro y derrape (inercia lateral)

  const speedFactor = 0.25 + 0.75 * speedRatio;
  if (isTurningLeft())  player.vx -= player.lateralInput *
  speedFactor;
  if (isTurningRight()) player.vx += player.lateralInput *
  speedFactor;
  // fuerza centrípeta:
  player.vx += curve * player.speed * player.centripetal;
  player.posx += player.vx;
  const grip = player.gripLat - speedRatio * 0.05;
  player.vx *= grip;
  // auto-recenter sin input:
  if (!isTurningLeft() && !isTurningRight() && !offRoad) {
      player.posx -= lastDelta * player.recenter;
  }

  Off-road

  - Trigger: Math.abs(lastDelta) > 130.
  - Decelera y aplica rumble lateral aleatorio (±2.5).

  FX de cámara (en racer.js render loop)

  - FOV dinámico: camera_distance lerp hacia
  base_camera_distance - speedRatio*6.
  - Nose-dive: al frenar con speed>4, camera_height lerp -6.
  - Screen shake: por encima del 85% de maxSpeed, jitter en
  lastDelta (±speedRatio*80).
  - Sprite drift: car_4/car_8 se eligen por umbral |vx| > 0.6,
  no sólo por tecla.

  Constantes tuneables (gameElements.js → player)

  ┌──────────────┬────────┬──────────────────────────────────┐
  │  Constante   │ Valor  │              Efecto              │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ acceleration │ 0.02   │ Legacy, ya no se usa directo     │
  │              │        │ (curva en physics)               │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ deceleration │ 0.2    │ Frenada por inercia (sin tecla)  │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ breaking     │ 0.6    │ Legacy, ya no se usa directo     │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ turning      │ 6.0    │ Legacy del modelo viejo          │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ maxSpeed     │ 20     │ Tope de velocidad                │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ vx           │ 0      │ Velocidad lateral instantánea    │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ gripLat      │ 0.88   │ Decay lateral. ↑ = más arcade, ↓ │
  │              │        │  = más drift                     │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ centripetal  │ 0.0009 │ Tirón en curvas                  │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ lateralInput │ 0.32   │ Respuesta del giro               │
  ├──────────────┼────────┼──────────────────────────────────┤
  │ recenter     │ 0.04   │ Velocidad de auto-centrado       │
  └──────────────┴────────┴──────────────────────────────────┘

  Render constants (gameElements.js → render)

  - width=320, height=240
  - depthOfField=150
  - base_camera_distance=20, base_camera_height=80 (las
  dinámicas se lerpean desde estas)

  Controles

  - Flechas: dirección y acelerar/frenar (38↑ accel, 40↓ brake,
  37← / 39→ giro).
  - Espacio: arrancar partida desde splash.
  - D: toggle debug.
  - Touchpad: mismo mapeo, umbral 0.3.

  Game loop / timing

  - remainingTime arranca a 100000ms, decrementa 16.67 por
  frame.
  - BONUS_TIME = 0 (deshabilitado, antes daba +5s por
  checkpoint).
  - Stages se detectan por Math.floor(absoluteIndex /
  roadParam.zoneSection) + 1.

  Convenciones

  - Sin frameworks, sin TS, sin tests.
  - Cambios incrementales, mantener canvas2D + shader pipeline
  intactos.
  - Sprites referenciados por {x,y,w,h} desde
  spritesheet.test.png.


