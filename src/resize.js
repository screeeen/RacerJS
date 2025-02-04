import { render } from './gameElements.js';

export const resize = () => {
    if (window.innerWidth / window.innerHeight > render.width / render.height) {
        var scale = window.innerHeight / render.height;
    } else {
        var scale = window.innerWidth / render.width;
    }
};
