import { spritesheet, context, startTime } from '../racer.js';

export const drawString = ({ string, pos, currentTimeString }) => {
    // console.log('currentTimeString', currentTimeString, startTime.getTime())
    if (string === undefined) return;
    string = string.toUpperCase();
    var cur = pos.x;

    for (var i = 0; i < string.length; i++) {
        context.drawImage(
            spritesheet,
            (string.charCodeAt(i) - 32) * 8,
            0,
            8,
            8,
            cur,
            pos.y,
            8,
            8
        );
        cur += 8;
    }
};
