import { context } from '../racer.js';
import { render } from '../gameElements.js';

export const drawTrapez = (
    pos1,
    scale1,
    offset1,
    pos2,
    scale2,
    offset2,
    delta1,
    delta2,
    color
) => {
    var demiWidth = render.width / 2;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(demiWidth + delta1 * render.width * scale1 + offset1, pos1);
    context.lineTo(demiWidth + delta1 * render.width * scale2 + offset2, pos2);
    context.lineTo(demiWidth + delta2 * render.width * scale2 + offset2, pos2);
    context.lineTo(demiWidth + delta2 * render.width * scale1 + offset1, pos1);
    context.fill();
    // context.stroke();
};
