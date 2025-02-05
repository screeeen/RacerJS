import {
    generateRoad,
    road,
    roadSegmentSize,
    numberOfSegmentPerColor,
} from './generateRoad.js';
import {
    car,
    car_4,
    car_8,
    render,
    player,
    npc,
    npc_sprite_dumb_spriteSheet,
} from './gameElements.js';
import { roadParam } from './generateRoad.js';
// import { generateBumpyRoad } from './src/generateBumpyRoad.js';
import { resize } from './resize.js';
import { drawString } from './draw/drawString.js';
import { drawSegment } from './draw/drawSegment.js';
import { drawImage } from './draw/drawImage.js';
import { drawSprite, drawNpcSprite } from './draw/drawSprite.js';
import { drawBackground } from './draw/drawBackground.js';
import { renderSplashFrame } from './renderSplashFrame.js';
import { getStages } from './stages.js';
import { getBackgroundColor } from './getBackgroundColor.js';
import { interpolateObjects, rgbToHex } from './utils.js';
import { DEBUG, drawDebugInfo, toggleDebug } from './debug.js';
import {
    initEngineSound,
    updateEngineSound,
    stopEngineSound,
} from './audio/engineSound.js';
import {
    // initBackgroundMusic,
    updateBackgroundMusic,
    stopBackgroundMusic,
} from './audio/backgroundMusic.js';

// -----------------------------
// ---  closure scoped vars  ---
// -----------------------------
export const canvas = document.getElementById('c');
export const context = canvas.getContext('2d');
export const startTime = new Date();
export let remainingTime = 10000; // 30 seconds in milliseconds
export let lastStageReached = 0;
export const BONUS_TIME = 1000; // 5 seconds bonus time per stage

let entrada;
let salida;
let printing;

// estoy tratando de sacar la funcion que controla los printers fuera del gameinterval.
// quiero usar un temporizador quie
export const printa = ({ currentTime, timer }) => {
    // Decrease remaining time by a fixed amount (16.67ms for 60fps)
    remainingTime -= 16.67;

    let remainingSec = Math.ceil(remainingTime / 1000);
    if (remainingSec < 10) remainingSec = '0' + remainingSec;

    drawString({ string: 'Time: ' + remainingSec, pos: { x: 2, y: 40 } });

    // Game over when time runs out
    if (remainingTime <= 0) {
        clearInterval(gameInterval);
        drawString({ string: 'GAME OVER!', pos: { x: 120, y: 100 } });
        stopEngineSound();
        stopBackgroundMusic();

        // Wait 2 seconds before restarting
        setTimeout(() => {
            remainingTime = 30000; // Reset timer
            player.position = 0; // Reset player position
            player.speed = 0; // Reset player speed
            lastStageReached = 0; // Reset stage progress
            splashInterval = setInterval(splashScreen, 60);
        }, 2000);
    }
};

export const spritesheet = new Image();
export const keys = []; // teclas

let lastDelta = 0;
let splashInterval;
let gameInterval;
let sceneryColor = getBackgroundColor();

//initialize the game
const init = () => {
    // configure canvas
    canvas.height = render.height;
    canvas.width = render.width;

    resize(render);

    //register key handeling:
    document.addEventListener('keydown', function (e) {
        keys[e.keyCode] = true;
    });
    document.addEventListener('keyup', function (e) {
        keys[e.keyCode] = false;
        if (e.keyCode === 68) {
            // 'D' key
            toggleDebug();
        }
    });

    // Add button controls
    const leftButton = document.getElementById('left');
    const rightButton = document.getElementById('right');
    const accelerateButton = document.getElementById('accelerate');

    leftButton.addEventListener('mousedown', () => {
        keys[37] = true;
        keys[38] = true; // Add acceleration when left button is pressed
    });
    leftButton.addEventListener('mouseup', () => {
        keys[37] = false;
        keys[38] = false; // Release acceleration when left button is released
    });
    leftButton.addEventListener('touchstart', () => {
        keys[37] = true;
        keys[38] = true; // Add acceleration when left button is touched
    });
    leftButton.addEventListener('touchend', () => {
        keys[37] = false;
        keys[38] = false; // Release acceleration when left touch ends
    });

    rightButton.addEventListener('mousedown', () => {
        keys[39] = true;
        keys[38] = true; // Add acceleration when right button is pressed
    });
    rightButton.addEventListener('mouseup', () => {
        keys[39] = false;
        keys[38] = false; // Release acceleration when right button is released
    });
    rightButton.addEventListener('touchstart', () => {
        keys[39] = true;
        keys[38] = true; // Add acceleration when right button is touched
    });
    rightButton.addEventListener('touchend', () => {
        keys[39] = false;
        keys[38] = false; // Release acceleration when right touch ends
    });

    accelerateButton.addEventListener('mousedown', () => {
        keys[38] = true;
        // Start game from splash screen when center button is pressed
        if (splashInterval) {
            clearInterval(splashInterval);
            splashInterval = null;
            remainingTime = 30000; // Reset timer
            player.position = 10; // Reset player position
            player.speed = 0; // Reset player speed
            lastStageReached = 0; // Reset stage progress
            gameInterval = setInterval(renderGameFrame, 1000 / 60);
            initEngineSound();
        }
    });
    accelerateButton.addEventListener('mouseup', () => (keys[38] = false));
    accelerateButton.addEventListener('touchstart', () => {
        keys[38] = true;
        // Start game from splash screen when center button is touched
        if (splashInterval) {
            clearInterval(splashInterval);
            splashInterval = null;
            remainingTime = 30000; // Reset timer
            player.position = 10; // Reset player position
            player.speed = 0; // Reset player speed
            lastStageReached = 0; // Reset stage progress
            gameInterval = setInterval(renderGameFrame, 1000 / 60);
            initEngineSound();
        }
    });
    accelerateButton.addEventListener('touchend', () => (keys[38] = false));

    // Add touch controls
    let isTouching = false;
    let touchX = 0;

    canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        isTouching = true;
        touchX = e.touches[0].clientX;
        keys[38] = true; // Set acceleration key when touch starts

        // Start game from splash screen
        if (splashInterval) {
            clearInterval(splashInterval);
            splashInterval = null;
            remainingTime = 30000; // Reset timer
            player.position = 10; // Reset player position
            player.speed = 0; // Reset player speed
            lastStageReached = 0; // Reset stage progress
            gameInterval = setInterval(renderGameFrame, 1000 / 60);
            initEngineSound();
        }
    });

    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        touchX = e.touches[0].clientX;
    });

    canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        isTouching = false;
        keys[38] = false; // Release acceleration key when touch ends
        keys[37] = false; // Release left key
        keys[39] = false; // Release right key
    });

    // Modify the game loop to handle touch controls
    const handleTouchControls = () => {
        if (isTouching) {
            // Accelerate when touching
            keys[38] = true;
            // Turn based on touch position
            const halfWidth = canvas.width / 2;
            keys[37] = touchX < halfWidth; // Left
            keys[39] = touchX >= halfWidth; // Right
        } else {
            // Release acceleration when not touching
            keys[38] = false;
            keys[37] = false;
            keys[39] = false;
        }
    };

    generateRoad();
    // console.log('road', road);
};

//renders one frame
const renderGameFrame = () => {
    // Clean screen
    context.fillStyle = sceneryColor;
    context.fillRect(0, 0, render.width, render.height);

    // Draw debug information
    drawDebugInfo({ player, road, roadParam });

    // --------------------------
    // -- Update the NPC state --
    // --------------------------
    npc.speed = Math.min(npc.speed, npc.maxSpeed); //maximum speed
    npc.position += npc.speed;

    // --------------------------
    // -- Update the car state --
    // --------------------------
    if (Math.abs(lastDelta) > 130) {
        if (player.speed > 3) {
            player.speed -= 0.2;
        }
    } else {
        // read acceleration controls
        if (keys[38]) {
            // 38 up
            player.speed += player.acceleration;
        } else if (keys[40]) {
            // 40 down
            player.speed -= player.breaking;
        } else {
            player.speed -= player.deceleration;
        }
    }
    player.speed = Math.max(player.speed, 0); //cannot go in reverse
    player.speed = Math.min(player.speed, player.maxSpeed); //maximum speed
    player.position += player.speed;

    // Update engine sound
    updateEngineSound({
        speed: player.speed,
        maxSpeed: player.maxSpeed,
        acceleration: player.acceleration,
    });

    // Update background music
    updateBackgroundMusic('racing', player.speed, player.maxSpeed);

    // car turning
    let carSprite;
    if (keys[37]) {
        // 37 left
        if (player.speed > 0) {
            player.posx -= player.turning;
        }
        carSprite = {
            a: car_4,
            x: 117,
            y: 190,
        };
    } else if (keys[39]) {
        // 39 right
        if (player.speed > 0) {
            player.posx += player.turning;
        }
        carSprite = {
            a: car_8,
            x: 125,
            y: 190,
        };
    } else {
        carSprite = {
            a: car,
            x: 125,
            y: 190,
        };
    }

    const spriteBuffer = [];
    const npcSpriteBuffer = [];

    // --------------------------
    // --   Render the road    --
    // --------------------------
    let absoluteIndex = Math.floor(player.position / roadSegmentSize);

    const currentStagePos =
        Math.floor(absoluteIndex / roadParam.zoneSection) + 1;

    // Check if we've reached a new stage
    if (currentStagePos > lastStageReached) {
        lastStageReached = currentStagePos;
        remainingTime += BONUS_TIME;
        drawString({
            string: 'Extended Time! +5s',
            pos: { x: render.width / 2 - 60, y: render.height / 2 },
            time: 240000, // 24 frames at 24fps = 1 second
        });
    }

    const CHECKPOINT_PHASE =
        absoluteIndex > roadParam.zoneSection &&
        absoluteIndex < roadParam.zoneSection + 100;

    // --------------------------
    // --   Checkpoint!   --
    // --------------------------
    if (CHECKPOINT_PHASE) {
        drawString({ string: 'Checkpoint ', pos: { x: 100, y: 20 }, time: 10 });
    }

    // --------------------------
    // --   Finish!   --
    // --------------------------
    if (absoluteIndex >= roadParam.length - render.depthOfField - 1) {
        drawString({
            string: 'Lap completed!',
            pos: { x: 100, y: 20 },
        });
        // Reset player position to start a new lap
        player.position = 0;
        // Keep the game running - removed clearInterval and sound stops
    }

    let currentSegmentIndex = (absoluteIndex - 2) % road.length;
    let currentSegmentPosition =
        (absoluteIndex - 2) * roadSegmentSize - player.position;
    let currentSegment = road[currentSegmentIndex];

    // Drawing the background
    drawBackground(currentSegment.curve);

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

    let iter = render.depthOfField;

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

        const stages = getStages(counter < numberOfSegmentPerColor); // que raro

        let currentStagePos =
            Math.floor(absoluteIndex / roadParam.zoneSection) + 1;
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
            string: '' + 'stage ' + currentStagePos,
            pos: { x: 2, y: 10 },
        });

        drawString({
            string: '' + 'transition ' + t.toFixed(2),
            pos: { x: 2, y: 20 },
        });

        const currentStage = {
            currentPhase,
            lastPhase,
            t,
        };

        const colors = interpolateObjects(
            lastPhase.colors,
            currentPhase.colors,
            t
        );

        sceneryColor = colors.background;
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
        // --     Draw the npc     --
        // --------------------------

        if (currentSegment.npcSpriteDumb) {
            npcSpriteBuffer.push({
                y: render.height / 2 + startProjectedHeight,
                x:
                    render.width / 2 -
                    currentSegment.npcSpriteDumb.pos *
                        render.width *
                        currentScaling +
                    currentSegment.curve -
                    baseOffset -
                    (player.posx - baseOffset * 2) * currentScaling,
                ymax: render.height / 2 + lastProjectedHeight,
                s: currentScaling,
                i: currentSegment.npcSpriteDumb.type,
            });
        }

        // LOOP

        lastProjectedHeight = currentHeight;
        currentSegmentIndex = nextSegmentIndex;
        currentSegment = nextSegment;
        currentSegmentPosition += roadSegmentSize;

        counter = (counter + 1) % (2 * numberOfSegmentPerColor);
    }

    // pinta los sprites del decorado
    let sprite;
    while ((sprite = spriteBuffer.pop())) {
        // console.log(' * sprite', sprite);
        drawSprite(sprite);
    }

    // --------------------------
    // --     Draw the car     --
    // --------------------------

    drawImage(carSprite.a, carSprite.x, carSprite.y, 1);

    // --------------------------
    // --     Draw the npc     --
    // --------------------------

    // INTENTO 1
    // pinta 1 npc - testing dumb
    let npcDumb;
    // esta pintando el sprite dumb del npcDumb coche ahí delante
    while ((npcDumb = npcSpriteBuffer.pop())) {
        // console.log(' * npcDumb', npcDumb);
        // drawImage(npcDumb.src, npcDumb.pos, 1, 1);
        drawNpcSprite(npcDumb);
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
        pos: { x: 287, y: 1 },
    });

    let speed = Math.round((player.speed / player.maxSpeed) * 200);
    drawString({ string: '' + speed + 'mph', pos: { x: 280, y: 20 } });

    drawString({
        string: '' + 'absoluteIndex ' + absoluteIndex,
        pos: { x: 2, y: 1 },
    });

    ///////// TIMER /////////
    let now = new Date();
    let diff = now.getTime() - startTime.getTime();
    let min = Math.floor(diff / 60000);
    let sec = Math.floor((diff - min * 60000) / 1000);
    if (sec < 10) sec = '0' + sec;
    let mili = Math.floor(diff - min * 60000 - sec * 1000);
    if (mili < 100) mili = '0' + mili;
    if (mili < 10) mili = '0' + mili;

    // const currentTimeString = "" + min + ":" + sec;

    printa({ currentTime: now, timer: 1000 });
};

////////////////// SPLASH //////////////////

// splash
const splashScreen = () => {
    renderSplashFrame();
    if (keys[32]) {
        initEngineSound();
        // initBackgroundMusic();
        updateBackgroundMusic('racing');
        clearInterval(splashInterval);
        gameInterval = setInterval(renderGameFrame, 24);
    }
};

// main
const start = () => {
    spritesheet.onload = function () {
        init();
        splashInterval = setInterval(splashScreen, 60);
        // console.log('splashInterval', splashInterval);
    };
    spritesheet.src = 'spritesheet.high.bw.png';
};

(() => start(spritesheet))();
