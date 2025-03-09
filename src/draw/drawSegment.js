import { context } from '../racer.js';
import { render } from '../gameElements.js';
import { drawTrapez } from './drawTrapez.js';

export const drawSegment = ({
    position1,
    scale1,
    offset1,
    position2,
    scale2,
    offset2,
    colors,
}) => {
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
        render.leftRoadBound, //-0.5, // ancho carriles
        render.rightRoadBound, //0.5, // ancho carriles
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
         0.01,
         -0.01,
         colors.lane
     );

    // drawTrapez(
    //     position1,
    //     scale1,
    //     offset1,
    //     position2,
    //     scale2,
    //     offset2,
    //     -0.18,
    //     -0.15,
    //     colors.lane
    // );

    // draw the other lane line
    // drawTrapez(
    //     position1,
    //     scale1,
    //     offset1,
    //     position2,
    //     scale2,
    //     offset2,
    //     -0.1,
    //     -0.3,
    //     colors.lane
    // );

    // drawTrapez(
    //     position1,
    //     scale1,
    //     offset1,
    //     position2,
    //     scale2,
    //     offset2,
    //     0.15,
    //     0.18,
    //     colors.lane
    // );
};
