import {
    generateRoad,
    road,
    roadSegmentSize,
    numberOfSegmentPerColor,
} from './generateRoad.js';
import {
    // car,
    // car_4,
    // car_8,
    render,
    player,
    // npc,
    // npc_sprite_dumb_spriteSheet,
} from './gameElements.js';
import { roadParam } from './generateRoad.js';
// import { generateBumpyRoad } from './src/generateBumpyRoad.js';
import { resize } from './resize.js';
import { drawString } from './draw/drawString.js';
import { drawSegment } from './draw/drawSegment.js';
import { drawSprite } from './draw/drawSprite.js';
import { drawBackground } from './draw/drawBackground.js';
import { renderSplashFrame } from './renderSplashFrame.js';
import { getStages } from './stages.js';
import { getBackgroundColor } from './getBackgroundColor.js';
import { interpolateObjects } from './utils.js';
import { drawDebugInfo, toggleDebug } from './debug.js';
import {
    initEngineSound,
    updateEngineSound,
    stopEngineSound,
} from './audio/engineSound.js';
import // initBackgroundMusic,
// updateBackgroundMusic,
// stopBackgroundMusic,
'./audio/backgroundMusic.js';

// -----------------------------
// ---  closure scoped vars  ---
// -----------------------------
export const canvas = document.getElementById('c');
export const context = canvas.getContext('2d');
export const startTime = new Date();
export let remainingTime = 10000; // 30 seconds in milliseconds
export let isGameStarted = false;
export let lastStageReached = 0;
export const BONUS_TIME = 1000; // 5 seconds bonus time per stage

export const spritesheet = new Image();
spritesheet.src = 'spritesheet.high.bw.png';
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

    // Add touch controls
    let isTouching = false;
    let touchX = 0;
    let touchY = 0;
    const touchPad = document.getElementById('touch-pad');
    // TODO: style it
    const touchCoordDisplay = document.createElement('div');
    touchCoordDisplay.style.position = 'absolute';
    touchCoordDisplay.style.color = 'white';
    touchCoordDisplay.style.padding = '5px';
    touchCoordDisplay.style.fontSize = '12px';
    touchPad.appendChild(touchCoordDisplay);

    const updateTouchCoordinates = (e, element) => {
        e.preventDefault();
        const touch = e.touches[0];

        const rect = element.getBoundingClientRect();

        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);

        // Set directional controls based on x threshold values
        keys[37] = x < -0.3; // Left key when x < -0.3
        keys[39] = x > 0.3; // Right key when x > 0.3

        // Set acceleration based on y threshold values
        if (y < -0.3) {
            keys[38] = false; // Release acceleration
            keys[40] = true; // Apply brake
        } else if (y > 0.3) {
            keys[38] = true; // Apply acceleration
            keys[40] = false; // Release brake
        } else {
            keys[38] = false; // No acceleration in neutral zone
            keys[40] = false; // No brake in neutral zone
        }

        touchCoordDisplay.textContent = `X: ${x.toFixed(2)} Y: ${y.toFixed(2)}`;
    };

    touchPad.addEventListener('touchstart', function (e) {
        e.preventDefault();
        isTouching = true;
        updateTouchCoordinates(e, this);

        // Start game from splash screen
        if (!isGameStarted) startGame();
    });

    touchPad.addEventListener('touchmove', function (e) {
        e.preventDefault();
        updateTouchCoordinates(e, this);
    });

    touchPad.addEventListener('touchend', function (e) {
        e.preventDefault();
        isTouching = false;
        keys[38] = false; // Release acceleration key when touch ends
        keys[37] = false; // Release left key
        keys[39] = false; // Release right key
    });

    generateRoad();
};

//renders one frame
const renderGameFrame = () => {
    // Clean screen
    context.fillStyle = sceneryColor;
    context.fillRect(0, 0, render.width, render.height);

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
    // updateBackgroundMusic('racing', player.speed, player.maxSpeed);

    // car turning painting on screen,
    // commented since no player car on screen
    // let carSprite;
    if (keys[37]) {
        // 37 left
        if (player.speed > 0) {
            player.posx -= player.turning;
        }
        //     carSprite = {
        //         a: car_4,
        //         x: 117,
        //         y: 190,
        //     };
    } else if (keys[39]) {
        // 39 right
        if (player.speed > 0) {
            player.posx += player.turning;
        }
        //     carSprite = {
        //         a: car_8,
        //         x: 125,
        //         y: 190,
        //     };
        // } else {
        //     carSprite = {
        //         a: car,
        //         x: 125,
        //         y: 190,
        //     };
    }

    const spriteBuffer = [];

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

    // const CHECKPOINT_PHASE =
    //     absoluteIndex > roadParam.zoneSection &&
    //     absoluteIndex < roadParam.zoneSection + 100;

    // // --------------------------
    // // --   Checkpoint!   --
    // // --------------------------
    // if (CHECKPOINT_PHASE) {
    // }

    // --------------------------
    // --   Finish!   --
    // --------------------------
    if (absoluteIndex >= roadParam.length - render.depthOfField - 1) {
        drawString({
            string: 'Lap completed!',
            pos: { x: 100, y: 20 },
            time: 960000,
        });
        // Reset player position to start a new lap
        // player.position = 0;
        // Keep the game running - removed clearInterval and sound stops
    }

    let currentSegmentIndex = (absoluteIndex - 2) % road.length;
    let currentSegmentPosition =
        (absoluteIndex - 2) * roadSegmentSize - player.position;
    let currentSegment = road[currentSegmentIndex];

    // Drawing the background
    if (currentSegment.curve === undefined) {
        console.warn('Undefined curve detected in segment');
        currentSegment.curve = 0; // Provide a default value to prevent rendering issues
    }
    drawBackground(currentSegment.curve);

    // Draw debug information
    drawDebugInfo({ player, road, roadParam, absoluteIndex });

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
            // console.log('startIndex', startIndex);
            // console.log('endIndex', endIndex);
            // console.log('t', t);

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
        drawSprite(sprite);
    }

    // --------------------------
    // --     Draw the car     --
    // --------------------------

    // drawSprite({
    //     i: carSprite.a,
    //     x: carSprite.x,
    //     y: carSprite.y,
    //     s: 1,
    //     ymax: render.height,
    // });

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

    // Game over when time runs out
    if (remainingTime <= 0) {
        clearInterval(gameInterval);
        drawString({ string: 'GAME OVER!', pos: { x: 120, y: 100 } });
        stopEngineSound();
        isGameStarted = false;
        // stopBackgroundMusic();

        // Wait 2 seconds before restarting
        setTimeout(() => {
            splashInterval = setInterval(splashScreen, 60);
        }, 2000);
    }
};

////////////////// SPLASH //////////////////
const splashScreen = () => {
    renderSplashFrame();

    if (keys[32]) {
        if (!isGameStarted) startGame();
    }
};

const startGame = () => {
    isGameStarted = true;
    if (splashInterval) {
        clearInterval(splashInterval);
        splashInterval = null;
        remainingTime = 30000; // Reset timer
        player.position = 10; // Reset player position
        player.speed = 0; // Reset player speed
        console.log(player);
        lastStageReached = 0; // Reset stage progress
        gameInterval = setInterval(renderGameFrame, 1000 / 60);
        initEngineSound();
    }
};

// main
const start = () => {
    spritesheet.onload = function () {
        init();
        splashInterval = setInterval(splashScreen, 60);
    };
    spritesheet.src = 'spritesheet.high.bw.png';
};

(() => start(spritesheet))();
