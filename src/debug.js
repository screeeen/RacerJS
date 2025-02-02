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

    if (DEBUG.showFPS) {
        const currentTime = performance.now();
        const delta = currentTime - lastFrameTime;
        fps = Math.round(1000 / delta);
        lastFrameTime = currentTime;
        const fpsText = `FPS: ${fps}`;
        drawString({
            string: fpsText,
            pos: { x: rightSide - fpsText.length * 8, y: y },
            color: '#FFFF00',
        });
        y += lineHeight;
    }

    if (DEBUG.showPlayerInfo) {
        const speedText = `Speed: ${Math.round(player.speed)}`;
        drawString({
            string: speedText,
            pos: { x: rightSide - speedText.length * 8, y: y },
            color: '#FFFF00',
        });
        y += lineHeight;

        const posXText = `Pos X: ${player.posx.toFixed(2)}`;
        drawString({
            string: posXText,
            pos: { x: rightSide - posXText.length * 8, y: y },
            color: '#FFFF00',
        });
        y += lineHeight;

        const posZText = `Pos Z: ${player.position.toFixed(2)}`;
        drawString({
            string: posZText,
            pos: { x: rightSide - posZText.length * 8, y: y },
            color: '#FFFF00',
        });
        y += lineHeight;
    }

    if (DEBUG.showStageInfo) {
        const currentStage = Math.floor(
            player.position / roadParam.zoneSection
        );
        const stageText = `Stage: ${currentStage}`;
        drawString({
            string: stageText,
            pos: { x: rightSide - stageText.length * 8, y: y },
            color: '#FFFF00',
        });
        y += lineHeight;
    }

    if (DEBUG.showRoadInfo) {
        const segment = road[Math.floor(player.position)];
        if (segment) {
            const curveText = `Curve: ${Math.round(segment.curve)}`;
            drawString({
                string: curveText,
                pos: { x: rightSide - curveText.length * 8, y: y },
                color: '#FFFF00',
            });
            y += lineHeight;

            const heightText = `Height: ${Math.round(segment.height)}`;
            drawString({
                string: heightText,
                pos: { x: rightSide - heightText.length * 8, y: y },
                color: '#FFFF00',
            });
        }
    }
};
