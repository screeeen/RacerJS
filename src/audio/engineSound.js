// Engine sound synthesis using Web Audio API

let audioContext;
let oscillator;
let gainNode;
let filterNode;
let currentGear = 1;
let oscillator2;
let gainNode2;
let filterNode2;

// Gear thresholds and characteristics
const gearConfig = {
    1: { speedThreshold: 0.08, freqMultiplier: 1.4, filterMod: 1.2, baseFreq: 4 },
    2: { speedThreshold: 0.1, freqMultiplier: 1.2, filterMod: 1.4, baseFreq: 8 },
    3: { speedThreshold: 0.2, freqMultiplier: 1.0, filterMod: 1.6, baseFreq: 12 },
    4: { speedThreshold: 0.6, freqMultiplier: 0.8, filterMod: 1.8, baseFreq: 0.1 },
    5: { speedThreshold: 0.8, freqMultiplier: 0.6, filterMod: 2.0, baseFreq: 0 },
};

// Initialize audio context and nodes
export const initEngineSound = () => {
    if (audioContext) {
        stopEngineSound(); // Clean up existing audio context
    }
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillator for base engine sound
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';

    // Create second oscillator for richer sound
    oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'sawtooth';

    // Create gain nodes for volume control
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1; // Initial volume

    gainNode2 = audioContext.createGain();
    gainNode2.gain.value = 0.08; // Slightly lower volume for second oscillator

    // Create filters for engine sound shaping
    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.Q.value = 10;

    filterNode2 = audioContext.createBiquadFilter();
    filterNode2.type = 'lowpass';
    filterNode2.Q.value = 12; // Slightly different Q value

    // Connect the audio nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator2.connect(filterNode2);
    filterNode2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);

    // Start the oscillators
     oscillator.start();
     oscillator2.start();
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
                gainNode2.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode2.gain.exponentialRampToValueAtTime(
                    0.08,
                    audioContext.currentTime + 0.1
                );
                currentGear = gear;
            }
            break;
        }
    }

    // Calculate base frequency based on speed and current gear
    const baseFreq = gearConfig[currentGear].baseFreq;
    const maxFreq = 100;
    const gearFreqMod = gearConfig[currentGear].freqMultiplier;
    const frequency = isIdle
        ? baseFreq  
        : (baseFreq + (maxFreq - baseFreq) * speedRatio) * gearFreqMod;

    // Add slight random variation for second oscillator
    const frequency2 = frequency;// * (1 + (Math.random() * 0.02 - 0.01)); // ±1% variation

    // Smooth frequency transition
    oscillator.frequency.setTargetAtTime(
        frequency,
        audioContext.currentTime,
        isIdle ? 0.2 : 0.1
    );
    oscillator2.frequency.setTargetAtTime(
        frequency2,
        audioContext.currentTime,
        isIdle ? 0.2 : 0.1
    );

    // Adjust filter frequency based on acceleration and gear
    const gearFilterMod = gearConfig[currentGear].filterMod;
    const filterFreq = isIdle
        ? 100 + Math.sin(audioContext.currentTime * 4) * 20 // Add character to idle sound
        : (50 + speedRatio * 1000) * gearFilterMod;
    
    const filterFreq2 = filterFreq * (1 + (Math.random() * 0.04 - 0.02)); // ±2% variation

    filterNode.frequency.setTargetAtTime(
        filterFreq,
        audioContext.currentTime,
        isIdle ? 0.2 : 0.1
    );
    filterNode2.frequency.setTargetAtTime(
        filterFreq2,
        audioContext.currentTime,
        isIdle ? 0.2 : 0.1
    );

    // Adjust volume based on speed
    const volume = isIdle ? 0.25 : 0.1 + speedRatio * 0.2;
    const volume2 = volume * 0.8; // Slightly lower volume for second oscillator
    
    gainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
    gainNode2.gain.setTargetAtTime(volume2, audioContext.currentTime, 0.1);
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
    gainNode2.gain.setValueAtTime(gainNode2.gain.value, audioContext.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
    );

    // Schedule the stop
    setTimeout(() => {
        oscillator.stop();
        oscillator2.stop();
        audioContext.close();
        audioContext = null;
        oscillator = null;
        oscillator2 = null;
        gainNode = null;
        gainNode2 = null;
        filterNode = null;
        filterNode2 = null;
    }, 100);
};
