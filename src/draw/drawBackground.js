import { drawImage } from './drawImage.js';
import { background, topclouds } from '../gameElements.js';

const parallaxSpeed = 8;

export const drawBackground = (curve) => {
    // capas del background parallax
    var first = ((-curve * parallaxSpeed) / 2) % background.w;
    var second = ((-curve * parallaxSpeed) / 4) % topclouds.w;
    var third = ((-curve * parallaxSpeed) / 8) % topclouds.w;
    var bgHeight = 80;

    drawImage(background, first - background.w + 1, bgHeight, 1); // right
    drawImage(background, first + background.w - 1, bgHeight, 1); // left
    drawImage(background, first, bgHeight, 1); // center

    drawImage(topclouds, second - topclouds.w + 1, 0, 1);
    drawImage(topclouds, second + topclouds.w - 1, 0, 1);
    drawImage(topclouds, second, 0, 1);

    // drawImage(topclouds, third + topclouds.w - 1, 0, 1);
    // drawImage(topclouds, third, 0, 1);
    // drawImage(topclouds, third, 0, 1);
};
