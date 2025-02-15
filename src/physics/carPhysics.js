import { player } from '../gameElements.js';
import { isAccelerating, isBraking, isTurningLeft, isTurningRight } from '../controllers/gameControls.js';

export const updateCarPhysics = ({ lastDelta }) => {
    // Handle speed based on collision detection
    if (Math.abs(lastDelta) > 130) {
        if (player.speed > 3) {
            player.speed -= 0.2;
        }
    } else {
        // Handle acceleration controls
        if (isAccelerating()) {
            player.speed += player.acceleration;
        } else if (isBraking()) {
            player.speed -= player.breaking;
        } else {
            player.speed -= player.deceleration;
        }
    }

    // Handle turning
    if (isTurningLeft()) {
        if (player.speed > 0) {
            player.posx -= player.turning;
        }
    } else if (isTurningRight()) {
        if (player.speed > 0) {
            player.posx += player.turning;
        }
    }

    // Apply speed constraints
    player.speed = Math.max(player.speed, 0); // Cannot go in reverse
    player.speed = Math.min(player.speed, player.maxSpeed); // Maximum speed
    
    // Update position
    player.position += player.speed;

    return player
};