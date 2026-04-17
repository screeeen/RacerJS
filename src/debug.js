import { drawString } from './draw/drawString.js';
import { render } from './gameElements.js';

export const DEBUG = {
    enabled: true,
    showFPS: true,
    showPlayerInfo: true,
    showRoadInfo: true,
};

let lastFrameTime = performance.now();
let fps = 0;

// Toggle debug mode
export const toggleDebug = () => {
    DEBUG.enabled = !DEBUG.enabled;
    // Toggle all debug information flags
    DEBUG.showFPS = DEBUG.enabled;
    DEBUG.showPlayerInfo = DEBUG.enabled;
    DEBUG.showRoadInfo = DEBUG.enabled;
};

// Debug information display
export const drawDebugInfo = ({ player, road, absoluteIndex }) => {
    if (!DEBUG.enabled) return;

    let y = 30;
    const lineHeight = 10;
    const rightMargin = 10;
    const rightSide = render.width - rightMargin;

    const debugItems = [
        {
            condition: DEBUG.showFPS,
            items: [
                () => {
                    const currentTime = performance.now();
                    const delta = currentTime - lastFrameTime;
                    fps = Math.round(1000 / delta);
                    lastFrameTime = currentTime;
                    return `FPS: ${fps}`;
                },
            ],
        },
        {
            condition: DEBUG.showPlayerInfo,
            items: [
                () => `Speed RRR: ${Math.round(player.speed)}`,
                () => `Pos X: ${player.posx.toFixed(2)}`,
                () => `Pos Z: ${player.position.toFixed(2)}`,
            ],
        },
        {
            condition: DEBUG.showRoadInfo,
            items: [
                () => {
                    const segment = road[Math.floor(player.position)];
                    if (!segment) return null;
                    return [
                        `AbsoluteIndex: ${absoluteIndex}`,
                        `Curve: ${Math.round(segment.curve)}`,
                        `Height: ${Math.round(segment.height)}`,
                    ];
                },
            ],
        },
    ];

    debugItems.forEach(({ condition, items }) => {
        if (!condition) return;

        items.forEach((item) => {
            const result = item();
            if (!result) return;

            const texts = Array.isArray(result) ? result : [result];
            texts.forEach((text) => {
                drawString({
                    string: text,
                    pos: { x: rightSide - text.length * 8, y },
                });
                y += lineHeight;
            });
        });
    });
};
