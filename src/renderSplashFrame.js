import { context, keys } from './racer.js';
import { render } from './gameElements.js';
// import { roadParam } from './generateRoad.js';
import { drawString } from './draw/drawString.js';

export const renderSplashFrame = () => {
    // console.log('render splash')
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, render.width, render.height);
    // context.font = "bold 48px serif";

    // context.drawImage(spritesheet,  357, 9, 115, 20, 100, 20, 115, 40);
    drawString({ string: 'A GAME', pos: { x: 100, y: 30 } });
    // drawString({string: "Instructions:", pos: { x: 100, y: 90 }});
    // drawString({string: "space to start, arrows to drive", pos: { x: 30, y: 100 }});
    // drawString({string: "Credits:", pos: { x: 120, y: 120 }});
    // drawString({string: "code, art: Selim Arsever", pos: { x: 55, y: 130 }});
    // drawString({string: "font: spicypixel.net", pos: { x: 70, y: 140 }});
};
