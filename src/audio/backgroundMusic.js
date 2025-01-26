// Background music synthesis using Web Audio API

let audioContext;
let oscillators = [];
let gainNodes = [];
let isPlaying = false;
let currentState = 'menu';
let bpm = 120;
let lastNoteTime = 0;

// Fanfare-style chord progressions at 120 BPM
const notes = {
    menu: [
        [523.25, 659.25, 783.99], // C5 major (bright)
        [587.33, 739.99, 880.0], // D5 major (fanfare)
        [659.25, 830.61, 987.77], // E5 major (triumphant)
        [698.46, 880.0, 1046.5], // F5 major (festive)
    ],
    racing: [
        [523.25, 622.25, 783.99], // C5 dominant (energetic)
        [493.88, 622.25, 739.99], // B4 dominant (driving)
        [440.0, 554.37, 698.46], // A4 dominant (upbeat)
        [415.3, 523.25, 659.25], // G#4 dominant (exciting)
    ],
    finish: [
        [523.25, 659.25, 783.99, 932.33], // C5maj7 (victorious)
        [440.0, 554.37, 698.46, 830.61], // A4maj7 (celebratory)
        [493.88, 622.25, 739.99, 880.0], // B4maj7 (triumphant)
        [440.0, 554.37, 698.46, 830.61], // A4maj7 (grand finale)
    ],
};

// Initialize audio context and oscillators
export const initBackgroundMusic = () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillators and gain nodes for jazz voicings
    for (let i = 0; i < 4; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.type = i === 3 ? 'sine' : 'triangle';
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        gainNode.gain.value = 0;

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillators.push(oscillator);
        gainNodes.push(gainNode);

        oscillator.start();
    }
};

// Update music based on game state
export const updateBackgroundMusic = (state, speed = 0, maxSpeed = 1) => {
    if (!audioContext) return;

    // Update frequencies based on state with jazz progression
    const currentNotes = notes[state];
    const progressionIndex = Math.floor(
        (audioContext.currentTime * 2) % currentNotes.length
    );
    const currentChord = currentNotes[progressionIndex];

    oscillators.forEach((osc, i) => {
        if (i < currentChord.length) {
            osc.frequency.setTargetAtTime(
                currentChord[i],
                audioContext.currentTime,
                0.1
            );
        }
    });

    // Adjust volume based on speed (only during racing)
    const baseVolume =
        state === 'racing' ? 0.05 + (speed / maxSpeed) * 0.1 : 0.1;

    gainNodes.forEach((gain) => {
        gain.gain.setTargetAtTime(baseVolume, audioContext.currentTime, 0.1);
    });

    currentState = state;

    if (!isPlaying) {
        isPlaying = true;
    }
};

// Stop background music
export const stopBackgroundMusic = () => {
    if (!audioContext) return;

    gainNodes.forEach((gain) => {
        gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
    });

    isPlaying = false;
};
