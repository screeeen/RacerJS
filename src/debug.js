import { drawString } from './draw/drawString.js';
import { render } from './gameElements.js';

export const DEBUG = {
    enabled: true,
    showFPS: true,
    showPlayerInfo: true,
    showStageInfo: true,
    showRoadInfo: true,
};

let lastFrameTime = performance.now();
let fps = 0;

// Toggle debug mode
export const toggleDebug = () => {
    DEBUG.enabled = !DEBUG.enabled;
};

// Debug information display
export const drawDebugInfo = ({ player, road, roadParam }) => {
    if (!DEBUG.enabled) return;

    let y = 20;
    const lineHeight = 15;
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
                () => `Speed: ${Math.round(player.speed)}`,
                () => `Pos X: ${player.posx.toFixed(2)}`,
                () => `Pos Z: ${player.position.toFixed(2)}`,
            ],
        },
        {
            condition: DEBUG.showStageInfo,
            items: [
                () => {
                    const currentStage = Math.floor(
                        player.position / roadParam.zoneSection
                    );
                    return `Stage: ${currentStage}`;
                },
            ],
        },
        {
            condition: DEBUG.showRoadInfo,
            items: [
                () => {
                    const segment = road[Math.floor(player.position)];
                    if (!segment) return null;
                    return [
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
