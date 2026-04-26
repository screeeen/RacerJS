import { roadSegmentSize } from './generateRoad.js';
import { player, render } from './gameElements.js';

export const npcs = [];

const LANES = [-0.25, 0, 0.25];

const COLLISION_LONGITUDINAL_THRESHOLD = 6;
const COLLISION_LATERAL_THRESHOLD = 45;
const COLLISION_PLAYER_SPEED_FACTOR = 0.4;
const COLLISION_NPC_SPEED_FACTOR = 0.6;
const COLLISION_PUSH = 10;

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

export const initNpcs = () => {
    npcs.length = 0;
    npcs.push(
        { position: 100, laneOffset: -0.25, baseSpeed: 10, speed: 10 },
        { position: 200, laneOffset: 0, baseSpeed: 12, speed: 12 },
        { position: 350, laneOffset: 0.25, baseSpeed: 15, speed: 15 }
    );
    for (const n of npcs) {
        n.targetLaneOffset = n.laneOffset;
        n.laneTimer = LANE_TIMER_MIN + Math.floor(Math.random() * LANE_TIMER_RANGE);
    }
};

export const updateNpcs = (road, playerLateralX) => {
    for (const npc of npcs) {
        const dz = npc.position - player.position;
        if (Math.abs(dz) < COLLISION_LONGITUDINAL_THRESHOLD) {
            const npcWorldX = npc.laneOffset * render.width;
            const dx = npcWorldX - playerLateralX;
            if (Math.abs(dx) < COLLISION_LATERAL_THRESHOLD) {
                player.speed *= COLLISION_PLAYER_SPEED_FACTOR;
                npc.speed *= COLLISION_NPC_SPEED_FACTOR;
                player.posx += dx < 0 ? COLLISION_PUSH : -COLLISION_PUSH;
            }
        }

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

        const noise = (Math.random() - 0.5) * SPEED_NOISE_RANGE;

        const targetSpeed =
            npc.baseSpeed - curveSlowdown + rubberband + noise;
        npc.speed += (targetSpeed - npc.speed) * SPEED_SMOOTHING;
        npc.position += npc.speed;

        npc.laneTimer -= 1;
        if (npc.laneTimer <= 0) {
            npc.targetLaneOffset =
                LANES[Math.floor(Math.random() * LANES.length)];
            npc.laneTimer = LANE_TIMER_MIN + Math.floor(Math.random() * LANE_TIMER_RANGE);
        }
        npc.laneOffset += (npc.targetLaneOffset - npc.laneOffset) * LANE_SMOOTHING;
    }
};
