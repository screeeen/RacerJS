import {
    generateRoad,
    road,
    roadSegmentSize,
    numberOfSegmentPerColor,
} from './generateRoad.js';
import { car, car_4, car_8, render, player } from './gameElements.js';
import { roadParam } from './generateRoad.js';
// import { generateBumpyRoad } from './src/generateBumpyRoad.js';
import { resize } from './resize.js';
import { drawString } from './draw/drawString.js';
import { drawSegment } from './draw/drawSegment.js';
import { drawImage } from './draw/drawImage.js';
import { drawSprite } from './draw/drawSprite.js';
import { drawBackground } from './draw/drawBackground.js';
import { renderSplashFrame } from './renderSplashFrame.js';
import { getStages } from './stages.js';
import { getBackgroundColor } from './getBackgroundColor.js';
import { interpolateObjects, rgbToHex } from './utils.js';

// -----------------------------
// ---  closure scoped vars  ---
// -----------------------------
export const canvas = document.getElementById('c');
export const context = canvas.getContext('2d');
export const startTime = new Date();

let entrada;
let salida;
let printing;

// estoy tratando de sacar la funcion que controla los printers fuera del gameinterval.
// quiero usar un temporizador quie
export const printa = ({ currentTime, timer }) => {
    salida = currentTime.getTime() + timer;
    if (!entrada && !printing) {
        entrada = currentTime.getTime();
    }

    if (salida > entrada) {
        let t = currentTime.getTime();
        let min = Math.floor(t / 60000);
        let sec = Math.floor((t - min * 60000) / 1000);
        if (sec < 10) sec = '0' + sec;

        drawString({ string: 'time: ' + sec, pos: { x: 2, y: 40 } });
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
    });

    generateRoad();

    // console.log('road', road);
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
            //player.position += 0.1;
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

    // --------------------------
    // --   Render the road    --
    // --------------------------
    let absoluteIndex = Math.floor(player.position / roadSegmentSize);

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
        drawString(
            'gameInterval ' + gameInterval + '\nabsoluteIndex ' + absoluteIndex,
            { x: 100, y: 20 }
        );
        clearInterval(gameInterval);
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
        // --   DRAW SPRITES    --
        // --------------------------
        // console.log(
        //     'currentSegment',
        //     currentSegmentIndex,
        //     currentSegment.stage
        // );
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
                s: 2.5 * currentScaling,
                i: currentSegment.sprite.type,
            });
        }

        lastProjectedHeight = currentHeight;
        currentSegmentIndex = nextSegmentIndex;
        currentSegment = nextSegment;
        currentSegmentPosition += roadSegmentSize;

        counter = (counter + 1) % (2 * numberOfSegmentPerColor);
    }

    let sprite;
    while ((sprite = spriteBuffer.pop())) {
        drawSprite(sprite);
    }

    // --------------------------
    // --     Draw the car     --
    // --------------------------
    drawImage(carSprite.a, carSprite.x, carSprite.y, 1);

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

    // drawString(
    // {string: "" + "height " + road[absoluteIndex].height,
    //   pos:{ x: 2, y: 10 }}
    // );

    // drawString(
    //   {string: "" + "curve " + road[absoluteIndex].curve,
    //     pos:{ x: 2, y: 20 }}
    //   );

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
