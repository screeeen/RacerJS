import {context, keys} from '../racer.js'
import { car, car_4,car_8,background,tree,rock,bridge,house,logo,backgroundColor,render,roadParam,player } from './gameElements.js'
import { drawString } from '../drawString.js';

export const renderSplashFrame = () =>  {

    console.log('render splash')
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0, 0, render.width, render.height);
    // context.font = "bold 48px serif";

    // context.drawImage(spritesheet,  357, 9, 115, 20, 100, 20, 115, 40);
    drawString("A GAME", { x: 100, y: 30 });
    drawString("Instructions:", { x: 100, y: 90 });
    drawString("space to start, arrows to drive", { x: 30, y: 100 });
    drawString("Credits:", { x: 120, y: 120 });
    drawString("code, art: Selim Arsever", { x: 55, y: 130 });
    drawString("font: spicypixel.net", { x: 70, y: 140 });
    
  };