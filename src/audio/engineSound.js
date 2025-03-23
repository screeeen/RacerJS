// Engine sound synthesis using Web Audio API

let audioContext;
let oscillator;
let gainNode;
let filterNode;
let currentGear = 1;

// Gear thresholds and characteristics
const gearConfig = {
    1: { speedThreshold: 0.04, freqMultiplier: 1.4, filterMod: 1.2, baseFreq: 35 },
    2: { speedThreshold: 0.12, freqMultiplier: 1.2, filterMod: 1.4, baseFreq: 30 },
    3: { speedThreshold: 0.2, freqMultiplier: 1.0, filterMod: 1.6, baseFreq: 28 },
    4: { speedThreshold: 0.6, freqMultiplier: 0.8, filterMod: 1.8, baseFreq: 25 },
    5: { speedThreshold: 0.8, freqMultiplier: 0.6, filterMod: 2.0, baseFreq: 22 },
};

// Initialize audio context and nodes
export const initEngineSound = () => {
    if (audioContext) {
        stopEngineSound(); // Clean up existing audio context
    }
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillator for base engine sound
    oscillator = audioContext.createOscillator();
    oscillator.type = 'square';

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
    const isIdle = speedRatio < 0.01;

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
    const baseFreq = gearConfig[currentGear].baseFreq;
    const maxFreq = 250;
    const gearFreqMod = gearConfig[currentGear].freqMultiplier;
    const frequency = isIdle
        ? baseFreq  
        : (baseFreq + (maxFreq - baseFreq) * speedRatio) * gearFreqMod;

    // Smooth frequency transition
    oscillator.frequency.setTargetAtTime(
        frequency,
        audioContext.currentTime,
        isIdle ? 0.2 : 0.1
    );

    // Adjust filter frequency based on acceleration and gear
    const gearFilterMod = gearConfig[currentGear].filterMod;
    const filterFreq = isIdle
        ? 100 + Math.sin(audioContext.currentTime * 4) * 20 // Add character to idle sound
        : (50 + speedRatio * 1000) * gearFilterMod;
    filterNode.frequency.setTargetAtTime(
        filterFreq,
        audioContext.currentTime,
        isIdle ? 0.2 : 0.1
    );

    // Adjust volume based on speed
    const volume = isIdle ? 0.25 : 0.1 + speedRatio * 0.2;
    gainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
};

// Stop engine sound
export const stopEngineSound = () => {
    if (!audioContext) return;

    // Gracefully ramp down the volume
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
    );

    // Schedule the stop
    setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        audioContext = null;
        oscillator = null;
        gainNode = null;
        filterNode = null;
    }, 100);
};
