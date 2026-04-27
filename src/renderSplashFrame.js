import { context } from './racer.js';
import { render } from './gameElements.js';
import { drawString } from './draw/drawString.js';
import { gameMode, getCarPreset, loadHighscores } from './gameMode.js';

export const renderSplashFrame = () => {
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, render.width, render.height);

    drawString({ string: 'RACER JS', pos: { x: 110, y: 30 } });
    drawString({ string: 'SPACE TO START', pos: { x: 80, y: 50 } });

    const car = getCarPreset();
    drawString({
        string: 'C: CAR ' + car.name,
        pos: { x: 80, y: 80 },
    });
    drawString({
        string: 'T: ' + (gameMode.mode === 'time_attack' ? 'TIME ATTACK' : 'NORMAL'),
        pos: { x: 80, y: 90 },
    });

    drawString({ string: 'TOP SCORES', pos: { x: 100, y: 120 } });
    const hs = loadHighscores().slice(0, 3);
    if (hs.length === 0) {
        drawString({ string: '---', pos: { x: 140, y: 135 } });
    } else {
        hs.forEach((s, i) => {
            const line =
                (i + 1) + '. ' + s.pct + '% ' + s.totalSec + 'S ' + (s.car || '');
            drawString({ string: line, pos: { x: 60, y: 135 + i * 10 } });
        });
    }

    drawString({ string: 'D: DEBUG', pos: { x: 80, y: 220 } });
};
