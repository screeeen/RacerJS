import { roadSegmentSize } from './generateRoad.js';
import { player } from './gameElements.js';

export const npcs = [];

const LANES = [-0.25, 0, 0.25];

export const initNpcs = () => {
    npcs.length = 0;
    npcs.push(
        { position: 100, laneOffset: -0.25, baseSpeed: 10, speed: 10 },
        { position: 200, laneOffset: 0, baseSpeed: 12, speed: 12 },
        { position: 350, laneOffset: 0.25, baseSpeed: 15, speed: 15 }
    );
    for (const n of npcs) {
        n.targetLaneOffset = n.laneOffset;
        n.laneTimer = 120 + Math.floor(Math.random() * 180);
    }
};

export const updateNpcs = (road) => {
    for (const npc of npcs) {
        const segIdx =
            Math.floor(npc.position / roadSegmentSize) % road.length;
        const curveMag = Math.abs(road[segIdx].curve);
        const curveSlowdown = Math.min(curveMag * 0.01, 5);

        const distanceAhead = npc.position - player.position;
        let rubberband = 0;
        if (distanceAhead > 1500) {
            rubberband = -Math.min((distanceAhead - 1500) * 0.005, 8);
        } else if (distanceAhead < -500) {
            rubberband = Math.min((-distanceAhead - 500) * 0.005, 5);
        }

        const noise = (Math.random() - 0.5) * 0.5;

        const targetSpeed =
            npc.baseSpeed - curveSlowdown + rubberband + noise;
        npc.speed += (targetSpeed - npc.speed) * 0.05;
        npc.position += npc.speed;

        npc.laneTimer -= 1;
        if (npc.laneTimer <= 0) {
            npc.targetLaneOffset =
                LANES[Math.floor(Math.random() * LANES.length)];
            npc.laneTimer = 120 + Math.floor(Math.random() * 180);
        }
        npc.laneOffset += (npc.targetLaneOffset - npc.laneOffset) * 0.03;
    }
};
