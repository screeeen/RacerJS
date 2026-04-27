import { roadSegmentSize } from './generateRoad.js';
import { player, render } from './gameElements.js';
import { playCollision } from './audio/engineSound.js';
import { spawnCollisionFx } from './fx.js';
import { r } from './utils.js';

export const npcs = [];

const LANES = [-0.25, 0, 0.25];

// Geometría coords: render multiplica laneOffset*width=320 para offset visual.
// lane+ aparece a la IZQUIERDA en mundo (render.js: -laneOffset*width*scaling).
// Convertir laneOffset a equivalente lastDelta: cambiar signo y escalar por 320.
export const LANE_TO_LASTDELTA = 320;

// Half-widths en lastDelta units (sprite 69px / road 320px ≈ 0.215 lanes)
export const CAR_HALF_WIDTH_LASTDELTA = 34; // ≈ 0.106 lanes
// Half-lengths en player.position units (sprite 38px / scaling ~2 ≈ 19 world)
export const CAR_HALF_LENGTH_POS = 10;

// Suma de half-widths/lengths de player + NPC = threshold colisión
const COLLISION_LATERAL_THRESHOLD = 2 * CAR_HALF_WIDTH_LASTDELTA; // 68
const COLLISION_LONG_BASE = 2 * CAR_HALF_LENGTH_POS; // 20
const COLLISION_PLAYER_SPEED_FACTOR = 0.4;
const COLLISION_NPC_SPEED_FACTOR = 0.6;
const COLLISION_PUSH_LASTDELTA = 50;

const CURVE_SLOWDOWN_FACTOR = 0.01;
const CURVE_SLOWDOWN_MAX = 5;

const RUBBERBAND_DEADZONE = 200;
const RUBBERBAND_FACTOR = 0.02;
const RUBBERBAND_MAX = 10;

const SPEED_NOISE_RANGE = 0.5;
const SPEED_SMOOTHING = 0.05;
const LANE_SMOOTHING = 0.03;

const LANE_TIMER_MIN = 120;
const LANE_TIMER_RANGE = 180;

// personalidades: multiplica timer base. <1 = cambia carril más seguido
const PERSONALITY_TIMER_MULT = {
    aggressive: 0.5,
    normal: 1.0,
    cautious: 1.7,
};

export const initNpcs = () => {
    npcs.length = 0;
    npcs.push(
        { position: 100, laneOffset: -0.25, baseSpeed: 9, speed: 9, personality: 'cautious' },
        { position: 200, laneOffset: 0, baseSpeed: 11, speed: 11, personality: 'normal' },
        { position: 350, laneOffset: 0.25, baseSpeed: 13, speed: 13, personality: 'aggressive' },
        { position: 500, laneOffset: -0.25, baseSpeed: 14, speed: 14, personality: 'normal' },
        { position: 750, laneOffset: 0.25, baseSpeed: 16, speed: 16, personality: 'aggressive' }
    );
    for (const n of npcs) {
        n.targetLaneOffset = n.laneOffset;
        const mult = PERSONALITY_TIMER_MULT[n.personality] || 1.0;
        n.laneTimer = Math.floor(
            (LANE_TIMER_MIN + r() * LANE_TIMER_RANGE) * mult
        );
        n.colliding = false;
    }
};

export const updateNpcs = (road, playerLateralX) => {
    for (const npc of npcs) {
        const dz = npc.position - player.position;
        const relSpeed = Math.abs(player.speed - npc.speed);
        // anti-tunneling: ventana longitudinal escala con velocidad relativa
        const longThreshold = Math.max(COLLISION_LONG_BASE, relSpeed * 1.5);

        // signo invertido: lane+ corresponde a -lastDelta en world frame
        const npcLateral = -npc.laneOffset * LANE_TO_LASTDELTA;
        const dx = npcLateral - playerLateralX;
        const inWindow =
            Math.abs(dz) < longThreshold &&
            Math.abs(dx) < COLLISION_LATERAL_THRESHOLD;

        // edge-trigger: solo dispara al entrar a la zona, no cada frame
        if (inWindow && !npc.colliding) {
            playCollision();
            spawnCollisionFx();
            player.speed *= COLLISION_PLAYER_SPEED_FACTOR;
            npc.speed *= COLLISION_NPC_SPEED_FACTOR;
            // push lateral player + push longitudinal según rear/front-end
            const lateralDir = dx > 0 ? -1 : 1;
            player.posx += lateralDir * COLLISION_PUSH_LASTDELTA;
            // separación longitudinal: si NPC delante (dz>0), retroceder
            const longDir = dz > 0 ? -1 : 1;
            player.position += longDir * COLLISION_LONG_BASE;
        }
        npc.colliding = inWindow;

        const segIdx =
            Math.floor(npc.position / roadSegmentSize) % road.length;
        const curveMag = Math.abs(road[segIdx].curve);
        const curveSlowdown = Math.min(curveMag * CURVE_SLOWDOWN_FACTOR, CURVE_SLOWDOWN_MAX);

        const distanceAhead = npc.position - player.position;
        let rubberband = 0;
        if (distanceAhead > RUBBERBAND_DEADZONE) {
            rubberband = -Math.min((distanceAhead - RUBBERBAND_DEADZONE) * RUBBERBAND_FACTOR, RUBBERBAND_MAX);
        } else if (distanceAhead < -RUBBERBAND_DEADZONE) {
            rubberband = Math.min((-distanceAhead - RUBBERBAND_DEADZONE) * RUBBERBAND_FACTOR, RUBBERBAND_MAX);
        }

        const noise = (r() - 0.5) * SPEED_NOISE_RANGE;

        const targetSpeed =
            npc.baseSpeed - curveSlowdown + rubberband + noise;
        npc.speed += (targetSpeed - npc.speed) * SPEED_SMOOTHING;
        npc.position += npc.speed;

        npc.laneTimer -= 1;
        if (npc.laneTimer <= 0) {
            npc.targetLaneOffset =
                LANES[Math.floor(r() * LANES.length)];
            const mult = PERSONALITY_TIMER_MULT[npc.personality] || 1.0;
            npc.laneTimer = Math.floor(
                (LANE_TIMER_MIN + r() * LANE_TIMER_RANGE) * mult
            );
        }
        npc.laneOffset += (npc.targetLaneOffset - npc.laneOffset) * LANE_SMOOTHING;
    }
};
