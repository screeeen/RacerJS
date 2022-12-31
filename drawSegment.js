import { context } from './racer.js';
import { render } from './src/gameElements.js';
import { drawTrapez } from './drawTrapez.js';
import { rgbToHex, interpolateObjects } from './utils.js';
import { getStages, STAGESLENGTH } from './src/stages.js';
import { drawString } from './drawString.js';

export const drawSegment = ({
    position1,
    scale1,
    offset1,
    position2,
    scale2,
    offset2,
    alternate,
    finishStart,
    absoluteIndex,
    currentStage,
    colors,
}) => {
    // let color = {};

    // Color de la carretera en la fase actual
    // color = interpolateObjects(
    //     currentStage.lastPhase.colors,
    //     currentStage.currentPhase.colors,
    //     currentStage.t
    // );

    //draw grass:
    context.fillStyle = colors.grass;
    context.fillRect(0, position2, render.width, position1 - position2);

    // draw the road
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        -0.5, // ancho carriles
        0.5, // ancho carriles
        colors.road
    );

    // draw the road border
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        -0.5,
        -0.47,
        colors.border
    );

    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        0.47,
        0.5,
        colors.border
    );

    // draw the lane line
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        -0.18,
        -0.15,
        colors.lane
    );
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        0.15,
        0.18,
        colors.lane
    );
};
