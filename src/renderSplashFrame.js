import { context, keys } from './racer.js';
import { render } from './gameElements.js';
// import { roadParam } from './generateRoad.js';
import { drawString } from './draw/drawString.js';

export const renderSplashFrame = () => {
    // console.log('render splash')
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, render.width, render.height);

    drawString({ string: 'A GAME', pos: { x: 100, y: 30 } });
    drawString({ string: 'TOUCH to Start', pos: { x: 80, y: 40 } });
    drawString({ string: 'Touch left/right to steer', pos: { x: 40, y: 120 } });
};
