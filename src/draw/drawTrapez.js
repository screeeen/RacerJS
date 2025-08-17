// Modificar la importación para usar el contexto correcto
import { context, canvas2D, webglInitialized } from '../racer.js';
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
    // Usar el contexto correcto
    const ctx = webglInitialized ? canvas2D.getContext('2d') : context;
    var demiWidth = render.width / 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(demiWidth + delta1 * render.width * scale1 + offset1, pos1);
    ctx.lineTo(demiWidth + delta1 * render.width * scale2 + offset2, pos2);
    ctx.lineTo(demiWidth + delta2 * render.width * scale2 + offset2, pos2);
    ctx.lineTo(demiWidth + delta2 * render.width * scale1 + offset1, pos1);
    ctx.fill();
    // ctx.stroke();
};
