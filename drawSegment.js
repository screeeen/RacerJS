import { context } from './racer.js';
import { render } from './src/gameElements.js';
import { drawTrapez } from './drawTrapez.js';
import { rgbToHex, interpolateObjects } from './utils.js';
import { getStages, STAGESLENGTH } from './src/stages.js';
import { drawString } from './drawString.js';

export const drawSegment = (
    position1,
    scale1,
    offset1,
    position2,
    scale2,
    offset2,
    alternate,
    finishStart,
    absoluteIndex
) => {
    const stages = getStages(alternate);

    const getInterpolationRange = (stages, absoluteIndex, STAGESLENGTH) => {
        let currentPhasePosition = Math.floor(absoluteIndex / STAGESLENGTH) + 1;
        let lastPhasePosition = currentPhasePosition - 1;

        const currentPhase = stages[currentPhasePosition]
            ? stages[currentPhasePosition]
            : stages[0];
        const lastPhase = stages[lastPhasePosition]
            ? stages[lastPhasePosition]
            : stages[0];

        const startIndex = currentPhase.startIndex;
        const endIndex = currentPhase.endIndex;

        let t = 0;
        if (absoluteIndex >= startIndex && absoluteIndex < endIndex) {
            t = (absoluteIndex - startIndex) / (endIndex - startIndex);
        }

        drawString({
            string: '' + 'stage ' + currentPhasePosition,
            pos: { x: 2, y: 10 },
        });

        return {
            currentPhase,
            lastPhase,
            t,
        };
    };

    const currentStage = getInterpolationRange(
        stages,
        absoluteIndex,
        STAGESLENGTH
    );
    // console.log('currentStage', currentStage)

    let color = {};

    // Color de la carretera en la fase actual
    color = interpolateObjects(
        currentStage.lastPhase.colors,
        currentStage.currentPhase.colors,
        currentStage.t
    );

    //draw grass:
    context.fillStyle = color.grass;
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
        color.road
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
        color.border
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
        color.border
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
        color.lane
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
        color.lane
    );
};
