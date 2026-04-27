// Estado de modo de juego, preset de coche, y high scores

const HS_KEY = 'racerjs.highscores';

export const gameMode = {
    mode: 'normal', // 'normal' | 'time_attack'
    carIndex: 0,
};

export const CAR_PRESETS = [
    { name: 'STANDARD', maxSpeed: 20, gripLat: 0.88, centripetal: 0.5, lateralInput: 0.32 },
    { name: 'TURBO',    maxSpeed: 24, gripLat: 0.92, centripetal: 0.6, lateralInput: 0.28 },
    { name: 'GRIP',     maxSpeed: 18, gripLat: 0.82, centripetal: 0.4, lateralInput: 0.36 },
];

export const cycleCar = () => {
    gameMode.carIndex = (gameMode.carIndex + 1) % CAR_PRESETS.length;
};

export const toggleMode = () => {
    gameMode.mode = gameMode.mode === 'normal' ? 'time_attack' : 'normal';
};

export const getCarPreset = () => CAR_PRESETS[gameMode.carIndex];

export const loadHighscores = () => {
    try {
        return JSON.parse(localStorage.getItem(HS_KEY) || '[]');
    } catch (e) {
        return [];
    }
};

export const saveHighscore = (entry) => {
    const list = loadHighscores();
    list.push(entry);
    list.sort((a, b) => b.pct - a.pct || a.totalSec - b.totalSec);
    try {
        localStorage.setItem(HS_KEY, JSON.stringify(list.slice(0, 5)));
    } catch (e) {}
};
