export const generateAudio = (audioContext) => {
    // Crear un oscilador
    const oscillator1 = audioContext.createOscillator();
    // const oscillator2 = audioContext.createOscillator();

    // // aplica filtor
    // const filter = audioContext.createBiquadFilter();
    // filter.type = 'lowpass';
    // filter.frequency.value = 400;

    // // aplica ganancia
    // const gainNode = audioContext.createGain();
    // gainNode.gain.value = 0.5;

    // oscillator1.connect(gainNode);
    // gainNode.connect(audioContext.destination);

    // gainNode.connect(filter);
    // filter.connect(audioContext.destination);

    // Configuramos el tipo de oscilación como triangular
    oscillator1.type = 'square';
    // oscillator2.type = 'sine';

    // Configurar la frecuencia del oscilador
    oscillator1.frequency.value = 30;
    // oscillator2.frequency.value = 392;

    // Conectar el oscilador al dispositivo de audio del ordenador
    oscillator1.connect(audioContext.destination);
    // oscillator2.connect(audioContext.destination);

    // Iniciar la reproducción del oscilador
    oscillator1.start();

    // Parar la reproducción del oscilador después de 1 segundo
    setTimeout(() => {
        oscillator1.stop();
    }, 100);
};
