// Engine sound synthesis using Web Audio API

let audioContext;
let oscillator;
let gainNode;
let filterNode;
let currentGear = 1;

// Gear thresholds and characteristics
const gearConfig = {
    1: { speedThreshold: 0.2, freqMultiplier: 1.0, filterMod: 1.0 },
    2: { speedThreshold: 0.4, freqMultiplier: 0.85, filterMod: 1.2 },
    3: { speedThreshold: 0.6, freqMultiplier: 0.7, filterMod: 1.4 },
    4: { speedThreshold: 0.8, freqMultiplier: 0.6, filterMod: 1.6 },
    5: { speedThreshold: 1.0, freqMultiplier: 0.5, filterMod: 1.8 },
};

// Initialize audio context and nodes
export const initEngineSound = () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillator for base engine sound
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';

    // Create gain node for volume control
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1; // Initial volume

    // Create filter for engine sound shaping
    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.Q.value = 10;

    // Connect the audio nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();
};

// Update engine sound based on speed and acceleration
export const updateEngineSound = ({ speed, maxSpeed, acceleration }) => {
    if (!audioContext) return;

    const speedRatio = speed / maxSpeed;

    // Update current gear based on speed ratio
    for (let gear = 5; gear >= 1; gear--) {
        if (speedRatio >= gearConfig[gear].speedThreshold * 0.8) {
            if (currentGear !== gear) {
                // Gear shift effect
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(
                    0.1,
                    audioContext.currentTime + 0.1
                );
                currentGear = gear;
            }
            break;
        }
    }

    // Calculate base frequency based on speed and current gear
    const minFreq = 30;
    const maxFreq = 200;
    const gearFreqMod = gearConfig[currentGear].freqMultiplier;
    const frequency =
        (minFreq + (maxFreq - minFreq) * speedRatio) * gearFreqMod;

    // Smooth frequency transition
    oscillator.frequency.setTargetAtTime(
        frequency,
        audioContext.currentTime,
        0.1
    );

    // Adjust filter frequency based on acceleration and gear
    const gearFilterMod = gearConfig[currentGear].filterMod;
    const filterFreq = (50 + speedRatio * 1000) * gearFilterMod;
    filterNode.frequency.setTargetAtTime(
        filterFreq,
        audioContext.currentTime,
        0.1
    );

    // Adjust volume based on speed
    const volume = 0.05 + speedRatio * 0.15;
    gainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
};

// Stop engine sound
export const stopEngineSound = () => {
    if (!audioContext) return;
    oscillator.stop();
    audioContext.close();
};
