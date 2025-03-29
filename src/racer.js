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
    resetPlayer,
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
import { initControls, isAccelerating, isBraking, isTurningLeft, isTurningRight } from './controllers/gameControls.js';
import { updateCarPhysics } from './physics/carPhysics.js';

// -----------------------------
// ---  closure scoped vars  ---
// -----------------------------
export const canvas = document.getElementById('c');
export const context = canvas.getContext('2d');
export const startTime = new Date();
export let remainingTime
export let isGameStarted
export let lastStageReached
export const BONUS_TIME = 0; // 5 seconds bonus time per stage

export const spritesheet = new Image();
spritesheet.src = 'spritesheet.test.png';
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

    initControls({
         startGame,
        toggleDebug,
        isGameStarted
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
    updateCarPhysics({ lastDelta });

    // Update engine sound
    updateEngineSound({
        speed: player.speed,
        maxSpeed: player.maxSpeed,
        acceleration: player.acceleration,
    });

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

    // Draw debug information
    drawDebugInfo({ player, road, roadParam, absoluteIndex });
    
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
        resetPlayer(player)
        console.log(player);
        initEngineSound();
        initControls({
            startGame,
           toggleDebug,
           isGameStarted
       });
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
