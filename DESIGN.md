# RacerJS — Documento de diseño

Juego de carreras arcade tipo OutRun en JavaScript puro, sin frameworks.
Render canvas 2D escalado por shader WebGL fullscreen.

---

## 1. Pilares de diseño

1. **Velocidad arcade**: aceleración rápida, sensación de riesgo a tope.
2. **Lectura inmediata**: jugador entiende la curva antes de tomarla.
3. **Justo y duro**: penalizaciones claras pero recuperables.
4. **Estética pixel art con dithering**: 320×240 internos, paleta limitada.
5. **Sesión corta**: una run = 2-3 minutos. Reintento inmediato.

---

## 2. Loop de juego

```
Splash → Run (timer cuenta atrás) → Game over → Splash
```

- Tiempo inicial: 100s.
- Checkpoints opcionales (BONUS_TIME ahora 0, dejar como hook).
- Game over si timer llega a 0 antes de cruzar meta.
- Win condition: cruzar último segmento de la pista (`Lap completed!`).

---

## 3. Cámara

- 3D pseudo-proyección sobre carriles 2D (técnica OutRun clásica).
- `camera_distance` y `camera_height` lerpean hacia targets dinámicos.
- **FOV dinámico**: cámara se acerca con velocidad (clamp >= 17 para
  evitar singularidad en proyección).
- **Nose-dive** al frenar a velocidad media-alta.
- **Screen shake** en velocidad alta (>85%): jitter ±4px aplicado vía
  `context.translate`, NO sobre `lastDelta` (no contamina física).
- Limitar shake para no marear; subir gradual con velocidad.

---

## 4. Coche del jugador

### Física longitudinal
- Aceleración asintótica: `accel = 0.05 * (1 - speedRatio) + 0.008`.
- Frenado proporcional: `brake = 0.35 + speed * 0.05`.
- Off-road: deceleración fuerte aunque acelere.

### Física lateral (drift / inercia)
- `vx` velocidad lateral instantánea.
- Input lateral con factor de velocidad: a baja vel responde menos.
- **Centrífuga**: `vx -= (curve / maxCurve) * speedRatio * centripetal`.
  Empuja hacia afuera de la curva, jugador debe contrarrestar.
- **Grip lateral** decae con velocidad (más drift a tope).
- **Auto-recenter** suave sin input (fuerza de retorno al centro de pista).

### Sensación
- Sprite del coche cambia a `car_4` / `car_8` cuando |vx| > 0.6 (drift visual).
- A bajar, el sprite vuelve a centrado.

---

## 5. Pista / generación procedural

- `roadParam`:
  - `length`: zonas (15).
  - `zoneSection`: segmentos por zona (2000).
  - `roadSegmentSize`: 5 (longitud world por segmento).
  - `maxCurve`: intensidad máxima de curva (800).
  - `maxHeight`: elevación máxima (20000).
  - `curvy` / `mountainy`: probabilidades de transición de estado.
- Cada segmento tiene: `curve`, `height`, `sprite`, `stage`.
- Curva sinusoidal dentro de cada zona (suave entre estados).
- Última zona: retorna a curva 0 y altura 0 (loop estético).

---

## 6. Stages / biomas

8 fases con paleta + sprites distintos. Transiciones por `startIndex` /
`endIndex` que interpolan colores.

| # | Nombre       | Sprite        | isBackground |
|---|--------------|---------------|--------------|
| 0 | normal       | —             | sí           |
| 1 | casas        | house         | sí           |
| 2 | towers       | tower         | no           |
| 3 | desert       | tree/rock/bush| sí           |
| 4 | palms        | palm          | sí           |
| 5 | tundra       | rock/ruins    | sí           |
| 6 | tunel        | bridge        | no           |
| 7 | flat houses  | house_flat    | sí           |

---

## 7. NPCs

### Comportamiento
- 3 NPCs simultáneos, lanes [-0.25, 0, 0.25].
- Velocidad base individual con ruido suave + curve slowdown +
  rubberbanding (les empuja a no quedarse atrás/adelante del jugador).
- Cambio de carril aleatorio cada 2-5 segundos (smooth lerp).

### Colisiones
Coords coherentes en `lastDelta` units (factor 320, signo invertido).

- **Lateral threshold**: 68 (suma half-widths jugador+NPC, ≈ 0.215 lanes).
- **Longitudinal threshold**: max(20, relSpeed × 1.5) — anti-tunneling.
- **Edge-trigger** por NPC (`colliding` flag): efectos solo al entrar zona.
- **Efectos**: jugador `speed *= 0.4`, NPC `speed *= 0.6`,
  push lateral 50, push longitudinal 20.

### Justicia
- Speed reduction recuperable en ~2-3 segundos.
- Push separa fuera del threshold para que no encadene.
- Visual: outline en debug muestra cajas reales de colisión.

---

## 8. HUD

- Esquina superior derecha: porcentaje de pista completado.
- Esquina inferior derecha: velocidad en mph.
- Centro superior: timer (`Time: XX`).
- Esquina superior izquierda: nombre del stage / "comarca X".
- Mensajes flotantes: `Checkpoint!`, `Lap completed!`, `GAME OVER!`.

---

## 9. Audio

- Motor: pitch ligado a `speed/maxSpeed`.
- Pendiente: SFX colisión, derrape, checkpoint, música por stage.

---

## 10. Controles

| Acción       | Teclado    | Touchpad      |
|--------------|------------|---------------|
| Acelerar     | ↑          | swipe up      |
| Frenar       | ↓          | swipe down    |
| Girar izq.   | ←          | swipe left    |
| Girar der.   | →          | swipe right   |
| Start        | Space      | tap           |
| Debug toggle | D          | —             |

Debug muestra: FPS, info player, info road, outlines colisión,
y desactiva el dithering.

---

## 11. Estética

- Resolución interna fija 320×240, escalada al canvas WebGL.
- Shader post: dithering Bayer 4×4 (off en debug).
- Spritesheet único `spritesheet.test.png`.
- Background parallax 3 capas (curve-driven).

---

## 12. Constraints técnicos

- ES modules, sin frameworks, sin TypeScript, sin tests.
- Mantener pipeline canvas2D → texture → shader fullscreen.
- 60fps vía `setInterval(renderGameFrame, 1000/60)`.
- Sin librerías externas.
- Cambios incrementales; no romper render loop.

---

## 13. Roadmap (orden sugerido)

### Inmediato
- [x] Tunear feeling de drift por stage (tundra=0.95 hielo, palms=0.85, tunel=0.92, desert=0.87).
- [x] SFX colisión y derrape (Web Audio: noise burst + skid loop por |vx|).
- [x] Reactivar BONUS_TIME en checkpoints (5s por checkpoint).

### Corto plazo
- [x] Más NPCs (5) con AI variada (cautious / normal / aggressive).
- [x] Curve indicator (flecha HUD ">>>" / "<<<" anticipa próxima curva).
- [x] Música por stage (chord pad procedural, root distinto por comarca).
- [x] Pantalla de score final con tiempo total y comarca alcanzada.

### Medio plazo
- [ ] Sistema de rutas ramificadas (clásico OutRun: izquierda/derecha al checkpoint).
- [x] Modo Time Attack (sin NPCs, tecla T en splash).
- [x] High scores locales (localStorage, top 5 en splash).
- [ ] Más stages / sprites (require artwork nuevo).

### Largo plazo
- [x] Selección de coche con stats distintos (3 presets: STANDARD / TURBO / GRIP, tecla C).
- [ ] Soundtrack diegético (radio FM con tracks) — pad sostenido por ahora.
- [ ] Replay system.
- [ ] Online leaderboard.

---

## 14. Métricas de éxito

- Tiempo medio por run: 2-3 min.
- Retry rate alto (≥3 reintentos por sesión).
- Sin glitches gráficos a velocidad máxima.
- Colisiones consistentes con outline visual.
- 60fps estables en navegador desktop, ≥30fps en móvil mid-range.

---

## 15. Anti-patrones a evitar

- Hard-coded magic numbers sin contexto en física: documentar `_LASTDELTA`,
  `_LANES`, `_POS` units en cada constante.
- Mutar `lastDelta` con efectos visuales (rompe física).
- Acumular recursos GL frame a frame (texture leak).
- Sumar features antes de pulir feeling base de la conducción.
- Comentarios obvios en código; preferir nombres claros.
