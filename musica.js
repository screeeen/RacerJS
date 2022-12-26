// Import SID.js library
import SID from 'sid.js'

// Create a new SID instance
const sid = new SID()

// Set waveform for each oscillator
sid.waveform(0, SID.WAVE_SAWTOOTH)
sid.waveform(1, SID.WAVE_SAWTOOTH)
sid.waveform(2, SID.WAVE_SAWTOOTH)

// Set attack, decay, and release values for each oscillator
sid.attackDecay(0, 0)
sid.attackDecay(1, 0)
sid.attackDecay(2, 0)

// Set frequencies for each oscillator
sid.frequency(0, 0x0a)
sid.frequency(1, 0x14)
sid.frequency(2, 0x20)

// Play the music
sid.play()
