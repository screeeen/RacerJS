import {
    generateRoad,
    road,
    roadSegmentSize,
    numberOfSegmentPerColor,
} from './generateRoad.js';
import {
    render,
    player,
    resetPlayer,
    car,
    car_4,
    car_8,
} from './gameElements.js';
import { roadParam } from './generateRoad.js';
import { resize } from './resize.js';
import { drawString } from './draw/drawString.js';
import { drawSegment } from './draw/drawSegment.js';
import { drawSprite } from './draw/drawSprite.js';
import { drawImage } from './draw/drawImage.js';
import { drawBackground } from './draw/drawBackground.js';
import { renderSplashFrame } from './renderSplashFrame.js';
import { getStages } from './stages.js';
import { getBackgroundColor } from './getBackgroundColor.js';
import { interpolateObjects, setSeed } from './utils.js';
import { drawDebugInfo, toggleDebug, DEBUG } from './debug.js';
import {
    initEngineSound,
    updateEngineSound,
    stopEngineSound,
    updateSkid,
    setMusicStage,
    setMusicVolume,
} from './audio/engineSound.js';
import {
    initControls,
    isTurningLeft,
    isTurningRight,
    isBraking,
    pauseState,
} from './controllers/gameControls.js';
import { updateCarPhysics } from './physics/carPhysics.js';
import { npcs, initNpcs, updateNpcs, CAR_HALF_WIDTH_LASTDELTA, CAR_HALF_LENGTH_POS } from './npc.js';
import { gameMode, getCarPreset, saveHighscore } from './gameMode.js';
import { fsSource, vsSource } from './shaders/shaders.js';
import { updateFx, drawFx, clearFx } from './fx.js';

// -----------------------------
// ---  closure scoped vars  ---
// -----------------------------
export const canvas = document.getElementById('c');
export const context = canvas.getContext('2d');

// --- Canvas WebGL ---
export const cgl = document.getElementById('canvasGL');
export const gl = cgl.getContext('webgl', {
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
});

export const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
};

const vs = compileShader(gl.VERTEX_SHADER, vsSource);
const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

// Quad (-1,-1) a (1,1)
const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

const ditherLoc = gl.getUniformLocation(program, 'u_dither');

export const startTime = new Date();
export let remainingTime;
export let isGameStarted;
export let lastStageReached;
export const BONUS_TIME = 5000; // 5s bonus por checkpoint

export const spritesheet = new Image();

let lastDelta = 0;
let splashInterval;
let gameInterval;
let sceneryColor = getBackgroundColor();
let isBackground = true;

// Textura GL reutilizable (antes se creaba 60 veces/seg → leak GPU)
const sharedTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, sharedTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

//initialize the game
const init = () => {
    // configure canvas
    canvas.height = render.height;
    canvas.width = render.width;

    resize();

    initControls({
        startGame,
        toggleDebug,
        isGameStarted,
    });

    generateRoad();
    initNpcs();
};

//renders one frame
const renderGameFrame = () => {
    // Pause: dibuja overlay y salta lógica
    if (pauseState.paused) {
        setMusicVolume(0);
        drawString({ string: 'PAUSE', pos: { x: 140, y: 110 } });
        drawString({ string: 'P TO RESUME', pos: { x: 110, y: 125 } });
        // Aún hay que subir textura para que GL muestre el frame
        gl.bindTexture(gl.TEXTURE_2D, sharedTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.uniform1f(ditherLoc, DEBUG.enabled ? 0 : 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        return;
    }

    // Clean screen
    context.fillStyle = sceneryColor;
    context.fillRect(0, 0, render.width, render.height);

    // Restaurar volumen de música por si venimos de pause
    setMusicVolume(1);

    // --------------------------
    // -- Update the car state --
    // --------------------------
    updateCarPhysics({ lastDelta });

    // Update engine sound
    updateEngineSound({
        speed: player.speed,
        maxSpeed: player.maxSpeed,
        acceleration: player.acceleration,
    });

    // Skid: intensidad ligada a |vx| sobre threshold
    updateSkid(Math.max(0, Math.abs(player.vx) - 0.6));

    const spriteBuffer = [];

    // --------------------------
    // --   Render the road    --
    // --------------------------
    let absoluteIndex = Math.floor(player.position / roadSegmentSize);

    const currentStagePos =
        Math.floor(absoluteIndex / roadParam.zoneSection) + 1;

    // Grip lateral por stage (interpolado en transiciones)
    {
        const _stages = getStages(true);
        const _now = _stages[currentStagePos] || _stages[0];
        const _prev = _stages[currentStagePos - 1] || _stages[0];
        const _t =
            _now.startIndex !== undefined &&
            absoluteIndex >= _now.startIndex &&
            absoluteIndex < _now.endIndex
                ? (absoluteIndex - _now.startIndex) /
                  (_now.endIndex - _now.startIndex)
                : 0;
        const _gPrev = _prev.gripLat || 0.88;
        const _gNow = _now.gripLat || 0.88;
        player.gripLat = _gPrev + (_gNow - _gPrev) * _t;
    }

    // Check if we've reached a new stage
    if (currentStagePos > lastStageReached) {
        lastStageReached = currentStagePos;
        remainingTime += BONUS_TIME;
        setMusicStage(currentStagePos);
        drawString({
            string: 'Checkpoint!',
            pos: { x: 100, y: 40 },
            time: 100,
        });
        drawString({
            string: 'Extended Time! +5s',
            pos: { x: render.width / 2 - 60, y: render.height / 2 },
            time: 100, // 24 frames at 24fps = 1 second
        });
    }

    // --------------------------
    // --   Finish!   --
    // --------------------------
    if (
        absoluteIndex >= roadParam.length - render.depthOfField - 1 &&
        gameInterval
    ) {
        clearInterval(gameInterval);
        gameInterval = null;
        const totalSec = Math.floor((Date.now() - startTime.getTime()) / 1000);
        saveHighscore({
            pct: 100,
            totalSec,
            car: getCarPreset().name,
            mode: gameMode.mode,
            seed: gameMode.currentSeed,
            at: Date.now(),
        });
        drawString({ string: 'LAP COMPLETED!', pos: { x: 100, y: 90 } });
        drawString({ string: 'TIEMPO: ' + totalSec + 'S', pos: { x: 110, y: 105 } });
        drawString({ string: 'COMARCAS: ' + lastStageReached, pos: { x: 110, y: 115 } });
        stopEngineSound();
        isGameStarted = false;
        setTimeout(() => {
            splashInterval = setInterval(splashScreen, 60);
        }, 4000);
    }

    let currentSegmentIndex = (absoluteIndex - 2) % road.length;
    let currentSegmentPosition =
        (absoluteIndex - 2) * roadSegmentSize - player.position;
    let currentSegment = road[currentSegmentIndex];

    if (currentSegment.curve === undefined) {
        console.warn('Undefined curve detected in segment');
        currentSegment.curve = 0; // Provide a default value to prevent rendering issues
    }

    let lastProjectedHeight = Number.POSITIVE_INFINITY;
    let counter = absoluteIndex % (2 * numberOfSegmentPerColor); // for alternating color band

    let playerPosSegmentHeight = road[absoluteIndex % road.length].height;
    let playerPosNextSegmentHeight =
        road[(absoluteIndex + 1) % road.length].height;
    let playerPosRelative =
        (player.position % roadSegmentSize) / roadSegmentSize;
    let playerHeight =
        render.camera_height +
        playerPosSegmentHeight +
        (playerPosNextSegmentHeight - playerPosSegmentHeight) *
            playerPosRelative;

    //base offset
    let baseOffset =
        currentSegment.curve +
        (road[(currentSegmentIndex + 1) % road.length].curve -
            currentSegment.curve) *
            playerPosRelative;

    lastDelta = player.posx - baseOffset * 2;

    // NPC update + collision con lastDelta fresco
    updateNpcs(road, lastDelta);

    // ---- Camera FX ----
    const speedRatio = player.speed / player.maxSpeed;

    // FOV dinámico: cámara se acerca con velocidad. Clamp >= 17 para que
    // (camera_distance + currentSegmentPosition) > 1 (segPos ∈ (-15,-10]).
    // Sin clamp, scaling = 30/~0 → -60 → carretera y sprites explotan.
    const targetCamDist = Math.max(
        render.base_camera_distance - speedRatio * 6,
        17
    );
    render.camera_distance += (targetCamDist - render.camera_distance) * 0.1;

    // Nose-dive al frenar
    const targetCamHeight = isBraking() && player.speed > 4
        ? render.base_camera_height - 6
        : render.base_camera_height;
    render.camera_height += (targetCamHeight - render.camera_height) * 0.15;

    // Screen shake en velocidad alta (solo render, no toca física)
    const shakeAmt = Math.max(0, speedRatio - 0.85) * 8;
    const shakeX = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt : 0;
    const shakeY = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt : 0;

    context.save();
    context.translate(shakeX, shakeY);

    if (isBackground) drawBackground(currentSegment.curve);

    let iter = render.depthOfField;
    let absoluteScanIndex = absoluteIndex - 2;

    while (iter--) {
        // Next Segment:
        let nextSegmentIndex = (currentSegmentIndex + 1) % road.length;
        let nextSegment = road[nextSegmentIndex];

        let startProjectedHeight = Math.floor(
            ((playerHeight - currentSegment.height) * render.camera_distance) /
                (render.camera_distance + currentSegmentPosition)
        );

        // scaling index
        let startScaling =
            30 / (render.camera_distance + currentSegmentPosition);

        let endProjectedHeight = Math.floor(
            ((playerHeight - nextSegment.height) * render.camera_distance) /
                (render.camera_distance +
                    currentSegmentPosition +
                    roadSegmentSize)
        );
        let endScaling =
            30 /
            (render.camera_distance + currentSegmentPosition + roadSegmentSize);

        let currentHeight = Math.min(lastProjectedHeight, startProjectedHeight);
        let currentScaling = startScaling;

        // ---------------------------
        // --   STAGES MECHANICS    --
        // --------------------------

        const stages = getStages(counter < numberOfSegmentPerColor);
        let lastStagePos = currentStagePos - 1;

        const currentPhase = stages[currentStagePos]
            ? stages[currentStagePos]
            : stages[0];

        const lastPhase = stages[lastStagePos]
            ? stages[lastStagePos]
            : stages[0];

        const startIndex = currentPhase.startIndex;
        const endIndex = currentPhase.endIndex;

        let t = 0;
        if (absoluteIndex >= startIndex && absoluteIndex < endIndex) {
            t = (absoluteIndex - startIndex) / (endIndex - startIndex);
        }

        drawString({
            string: '' + 'comarca ' + currentStagePos,
            pos: { x: 2, y: 10 },
        });

        const colors = interpolateObjects(
            lastPhase.colors,
            currentPhase.colors,
            t
        );

        sceneryColor = colors.background;
        //TODO: pasarle imagen de background a drawBackground
        isBackground = currentPhase.isBackground;
        // --------------------------
        // --   DRAW SEGMENTS    --
        // --------------------------
        if (currentHeight > endProjectedHeight) {
            drawSegment({
                position1: render.height / 2 + currentHeight, //pos
                scale1: currentScaling, //scale
                offset1:
                    currentSegment.curve -
                    baseOffset -
                    lastDelta * currentScaling, //offset
                position2: render.height / 2 + endProjectedHeight, //pos
                scale2: endScaling, //scale
                offset2:
                    nextSegment.curve - baseOffset - lastDelta * endScaling, //offset
                colors: colors,
            });
        }

        // --------------------------
        // --   DRAW PROPS --
        // --------------------------
        if (currentSegment.sprite) {
            spriteBuffer.push({
                y: render.height / 2 + startProjectedHeight,
                x:
                    render.width / 2 -
                    currentSegment.sprite.pos * render.width * currentScaling +
                    currentSegment.curve -
                    baseOffset -
                    (player.posx - baseOffset * 2) * currentScaling,
                ymax: render.height / 2 + lastProjectedHeight,
                s: 2.5 * currentScaling, // 2.5 es la escala de los sprites
                i: currentSegment.sprite.type,
            });
        }

        // --------------------------
        // --   DRAW NPCs --
        // --------------------------
        for (const npc of npcs) {
            if (
                Math.floor(npc.position / roadSegmentSize) === absoluteScanIndex
            ) {
                const npcScreenX =
                    render.width / 2 -
                    npc.laneOffset * render.width * currentScaling +
                    currentSegment.curve -
                    baseOffset -
                    (player.posx - baseOffset * 2) * currentScaling;
                const npcScreenY = render.height / 2 + startProjectedHeight;
                spriteBuffer.push({
                    y: npcScreenY,
                    x: npcScreenX,
                    ymax: render.height / 2 + lastProjectedHeight,
                    s: 2.5 * currentScaling,
                    i: car,
                });
                if (DEBUG.enabled) {
                    // box = own car half-width (en lastDelta proyectado)
                    const boxW = 2 * CAR_HALF_WIDTH_LASTDELTA * currentScaling;
                    const boxH = car.h * 2.5 * currentScaling;
                    const dz = npc.position - player.position;
                    const relSpeed = Math.abs(player.speed - npc.speed);
                    const longThreshold = Math.max(2 * CAR_HALF_LENGTH_POS, relSpeed * 1.5);
                    const active = Math.abs(dz) < longThreshold;
                    spriteBuffer.push({
                        debug: true,
                        x: npcScreenX - boxW / 2,
                        y: npcScreenY - boxH,
                        w: boxW,
                        h: boxH,
                        color: active ? '#f00' : '#ff0',
                    });
                }
            }
        }

        // LOOP

        lastProjectedHeight = currentHeight;
        currentSegmentIndex = nextSegmentIndex;
        currentSegment = nextSegment;
        currentSegmentPosition += roadSegmentSize;
        absoluteScanIndex++;

        counter = (counter + 1) % (2 * numberOfSegmentPerColor);
    }

    // pinta los sprites del decorado
    let sprite;
    while ((sprite = spriteBuffer.pop())) {
        if (sprite.debug) {
            context.strokeStyle = sprite.color;
            context.lineWidth = 1;
            context.strokeRect(sprite.x, sprite.y, sprite.w, sprite.h);
        } else {
            drawSprite(sprite);
        }
    }

    context.restore();

    // --------------------------
    // --     Draw the car     --
    // --------------------------
    let carSprite;
    const driftThresh = 0.6;
    if (player.vx < -driftThresh || (isTurningLeft() && player.speed > 0.5)) {
        carSprite = { a: car_4, x: 117, y: 190 };
    } else if (player.vx > driftThresh || (isTurningRight() && player.speed > 0.5)) {
        carSprite = { a: car_8, x: 125, y: 190 };
    } else {
        carSprite = { a: car, x: 125, y: 190 };
    }
    drawImage(carSprite.a, carSprite.x, carSprite.y, 1);

    updateFx();
    drawFx(context);

    if (DEBUG.enabled) {
        const centerX = carSprite.x + carSprite.a.w / 2;
        const playerScaling = 30 / render.camera_distance;
        const halfW = CAR_HALF_WIDTH_LASTDELTA * playerScaling;
        context.strokeStyle = '#0ff';
        context.lineWidth = 1;
        context.strokeRect(
            centerX - halfW,
            carSprite.y,
            halfW * 2,
            carSprite.a.h
        );
    }

    // --------------------------
    // --     Draw the hud     --
    // --------------------------
    drawString({
        string:
            '' +
            Math.round(
                (absoluteIndex / (roadParam.length - render.depthOfField)) * 100
            ) +
            '%',
        pos: { x: 280, y: 1 },
    });

    let speed = Math.round((player.speed / player.maxSpeed) * 200);
    drawString({ string: '' + speed + 'mph', pos: { x: 270, y: 220 } });

    // Mode + car indicator (esquina inferior izquierda)
    const _car = getCarPreset();
    drawString({
        string: (gameMode.mode === 'time_attack' ? 'TA ' : '') + _car.name,
        pos: { x: 5, y: 220 },
    });

    // Curve indicator: anticipa próxima curva mirando 30 segs adelante
    {
        const lookahead = 30;
        const curveNow = road[absoluteIndex % road.length].curve || 0;
        const curveAhead =
            road[(absoluteIndex + lookahead) % road.length].curve || 0;
        const delta = curveAhead - curveNow;
        let arrow = '';
        if (delta > 80) arrow = '>>>';
        else if (delta < -80) arrow = '<<<';
        if (arrow) drawString({ string: arrow, pos: { x: 145, y: 22 } });
    }

    // --------------------------
    // --     Timer logid     --
    // --------------------------
    let now = new Date();
    let diff = now.getTime() - startTime.getTime();
    let min = Math.floor(diff / 60000);
    let sec = Math.floor((diff - min * 60000) / 1000);
    if (sec < 10) sec = '0' + sec;
    let mili = Math.floor(diff - min * 60000 - sec * 1000);
    if (mili < 100) mili = '0' + mili;
    if (mili < 10) mili = '0' + mili;

    // Decrease remaining time by a fixed amount (16.67ms for 60fps)
    remainingTime -= 16.67;

    let remainingSec = Math.ceil(remainingTime / 1000);
    if (remainingSec < 10) remainingSec = '0' + remainingSec;

    drawString({ string: 'Time: ' + remainingSec, pos: { x: 120, y: 10 } });

    // Draw debug information
    drawDebugInfo({ player, road, absoluteIndex });

    // Game over when time runs out
    if (remainingTime <= 0) {
        clearInterval(gameInterval);
        const pct = Math.round(
            (absoluteIndex / (roadParam.length - render.depthOfField)) * 100
        );
        const totalSec = Math.floor((Date.now() - startTime.getTime()) / 1000);
        saveHighscore({
            pct,
            totalSec,
            car: getCarPreset().name,
            mode: gameMode.mode,
            seed: gameMode.currentSeed,
            at: Date.now(),
        });
        drawString({ string: 'GAME OVER!', pos: { x: 120, y: 90 } });
        drawString({ string: 'PISTA: ' + pct + '%', pos: { x: 120, y: 105 } });
        drawString({ string: 'TIEMPO: ' + totalSec + 'S', pos: { x: 120, y: 115 } });
        drawString({ string: 'COMARCA: ' + lastStageReached, pos: { x: 120, y: 125 } });
        stopEngineSound();
        isGameStarted = false;

        // Wait 3 seconds before restarting
        setTimeout(() => {
            splashInterval = setInterval(splashScreen, 60);
        }, 3000);
    }
    // Subir canvas2d como textura (reutiliza sharedTexture, no leak)
    gl.bindTexture(gl.TEXTURE_2D, sharedTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    // Dithering off en debug mode
    gl.uniform1f(ditherLoc, DEBUG.enabled ? 0 : 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

////////////////// SPLASH //////////////////
const splashScreen = () => {
    renderSplashFrame();
};

const startGame = () => {
    isGameStarted = true;
    if (splashInterval) {
        clearInterval(splashInterval);
        gameInterval = setInterval(renderGameFrame, 1000 / 60);
        // get this logic into a function
        splashInterval = null;
        remainingTime = 100000; // Reset timer
        lastStageReached = 0; // Reset stage progress
        pauseState.paused = false;
        clearFx();
        // Nueva seed cada partida → nuevo road
        const seed = (Math.random() * 0x7fffffff) | 0;
        setSeed(seed);
        generateRoad();
        gameMode.currentSeed = seed;
        resetPlayer(player);
        // Aplicar preset de coche seleccionado
        const preset = getCarPreset();
        player.maxSpeed = preset.maxSpeed;
        player.gripLat = preset.gripLat;
        player.centripetal = preset.centripetal;
        player.lateralInput = preset.lateralInput;
        // Time Attack: sin NPCs
        if (gameMode.mode === 'time_attack') npcs.length = 0;
        else initNpcs();
        initEngineSound();
    }
};

// main
const start = () => {
    spritesheet.onload = function () {
        init();
        splashInterval = setInterval(splashScreen, 60);
    };
    spritesheet.src = 'spritesheet.test.png';
};

(() => start(spritesheet))();
