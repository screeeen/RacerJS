import { context } from './racer.js';
import { render } from './gameElements.js';
import { drawString } from './draw/drawString.js';

export const renderSplashFrame = () => {
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, render.width, render.height);

    drawString({ string: 'CAR ', pos: { x: 100, y: 30 } });
    drawString({ string: 'TOUCH to Start', pos: { x: 80, y: 40 } });
};
