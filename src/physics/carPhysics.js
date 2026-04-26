import { player } from '../gameElements.js';
import { road, roadSegmentSize, roadParam } from '../generateRoad.js';
import { isAccelerating, isBraking, isTurningLeft, isTurningRight } from '../controllers/gameControls.js';

export const updateCarPhysics = ({ lastDelta }) => {
    const speedRatio = player.speed / player.maxSpeed;
    const offRoad = Math.abs(lastDelta) > 130;

    // ---- Longitudinal ----
    if (offRoad) {
        if (isAccelerating()) {
            if (player.speed > 3) player.speed -= 0.2;
            if (player.speed < 3) player.speed += 0.01;
        } else {
            player.speed -= player.deceleration;
        }
    } else {
        if (isAccelerating()) {
            // Curva asintótica: punch inicial, easing al tope
            const accel = 0.05 * (1 - speedRatio) + 0.008;
            player.speed += accel;
        } else if (isBraking()) {
            // Frenado proporcional a velocidad
            const brake = 0.35 + player.speed * 0.05;
            player.speed -= brake;
        } else {
            player.speed -= player.deceleration;
        }
    }

    // ---- Lateral (drift / inercia) ----
    const speedFactor = 0.25 + 0.75 * speedRatio;

    if (player.speed > 0) {
        if (isTurningLeft())  player.vx -= player.lateralInput * speedFactor;
        if (isTurningRight()) player.vx += player.lateralInput * speedFactor;
    }

    // Fuerza centrífuga: empuja hacia afuera en curvas a alta velocidad
    const segIndex = Math.floor(player.position / roadSegmentSize) % road.length;
    const curve = road[segIndex] ? road[segIndex].curve || 0 : 0;
    const curveNorm = curve / roadParam.maxCurve;
    player.vx -= curveNorm * speedRatio * player.centripetal;

    // Aplicar velocidad lateral
    player.posx += player.vx;

    // Decay grip lateral (más grip a baja velocidad, menos arriba)
    const grip = player.gripLat - speedRatio * 0.05;
    player.vx *= grip;

    // Auto-recenter suave cuando no hay input
    if (!isTurningLeft() && !isTurningRight() && !offRoad) {
        player.posx -= lastDelta * player.recenter;
    }

    // Off-road rumble
    if (offRoad && player.speed > 1) {
        player.posx += (Math.random() - 0.5) * 2.5;
    }

    // Constraints
    player.speed = Math.max(player.speed, 0);
    player.speed = Math.min(player.speed, player.maxSpeed);

    player.position += player.speed;

    return player;
};
