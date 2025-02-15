

// Game controls module
export const keys = [];

// Initialize game controls
export const initControls = ({ startGame, toggleDebug, isGameStarted }) => {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        console.log('hit', e.keyCode)
        keys[e.keyCode] = true;
        if (keys[32]) {
            if (!isGameStarted) startGame();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.keyCode] = false;
        if (e.keyCode === 68) { // 'D' key
            toggleDebug();
        }
    });

    // Touch controls
    const touchPad = document.getElementById('touch-pad');
    const touchCoordDisplay = document.createElement('div');
    touchCoordDisplay.style.position = 'absolute';
    touchCoordDisplay.style.color = 'white';
    touchCoordDisplay.style.padding = '5px';
    touchCoordDisplay.style.fontSize = '12px';
    touchPad.appendChild(touchCoordDisplay);

    const updateTouchCoordinates = (e, element) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();

        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);

        // Set directional controls based on x threshold values
        keys[37] = x < -0.3; // Left key when x < -0.3
        keys[39] = x > 0.3;  // Right key when x > 0.3

        // Set acceleration based on y threshold values
        if (y < -0.3) {
            keys[38] = false; // Release acceleration
            keys[40] = true;  // Apply brake
        } else if (y > 0.3) {
            keys[38] = true;  // Apply acceleration
            keys[40] = false; // Release brake
        } else {
            keys[38] = false; // No acceleration in neutral zone
            keys[40] = false; // No brake in neutral zone
        }

        touchCoordDisplay.textContent = `X: ${x.toFixed(2)} Y: ${y.toFixed(2)}`;
    };

    touchPad.addEventListener('touchstart', function(e) {
        e.preventDefault();
        updateTouchCoordinates(e, this);

        // Start game from splash screen
        if (!isGameStarted) startGame();
    });

    touchPad.addEventListener('touchmove', function(e) {
        e.preventDefault();
        updateTouchCoordinates(e, this);
    });

    touchPad.addEventListener('touchend', function(e) {
        e.preventDefault();
        keys[38] = false; // Release acceleration key
        keys[37] = false; // Release left key
        keys[39] = false; // Release right key
    });
};

// Control state getters
export const isAccelerating = () => keys[38];
export const isBraking = () => keys[40];
export const isTurningLeft = () => keys[37];
export const isTurningRight = () => keys[39];