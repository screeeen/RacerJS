import { drawImage } from "./drawImage.js";
import {background} from './src/gameElements.js'

export const drawBackground = (position) => {
    var first = (position / 2) % background.w;
    drawImage(background, first - background.w + 1, 0, 1);
    drawImage(background, first + background.w - 1, 0, 1);
    drawImage(background, first, 0, 1);
  };