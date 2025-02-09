import { spritesheet, context, startTime } from '../racer.js';

export const drawString = ({ string, pos, time, color = '#FFFFFF00' }) => {
    // If time is specified, check if the message should still be displayed
    if (time !== undefined) {
        const currentFrame = window.performance.now();

        if (!window.messageTimers) window.messageTimers = new Map();

        const messageKey = `${string}-${pos.x}-${pos.y}`;
        if (!window.messageTimers.has(messageKey)) {
            window.messageTimers.set(messageKey, currentFrame);
        }

        const startTime = window.messageTimers.get(messageKey);
        const elapsed = currentFrame - startTime;

        if (elapsed >= time * (1000 / 24)) {
            // Convert frames to milliseconds (24fps)
            window.messageTimers.delete(messageKey);
            string = undefined;
            return;
        }
    }
    // console.log('currentTimeString', currentTimeString, startTime.getTime())
    if (string === undefined) return;
    string = string.toUpperCase();
    var cur = pos.x;

    for (var i = 0; i < string.length; i++) {
        context.save();
        context.globalCompositeOperation = 'source-atop';
        context.fillStyle = color;
        context.fillRect(cur, pos.y, 8, 8);
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
        context.restore();
        cur += 8;
    }
};
