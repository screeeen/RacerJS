import { render } from './gameElements.js';
import { gl, cgl } from './racer.js';

export const resize = () => {
    if (window.innerWidth / window.innerHeight > render.width / render.height) {
        var scale = window.innerHeight / render.height;
    } else {
        var scale = window.innerWidth / render.width;
    }
    cgl.width = window.innerWidth;
    cgl.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
};
