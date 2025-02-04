import { context } from '../racer.js';
import { drawImage } from './drawImage.js';

// Batch sprites for more efficient rendering
let spriteRenderQueue = [];

export const drawSprite = (sprite) => {
    spriteRenderQueue.push(sprite);
};

export const drawNpcSprite = (sprite) => {
    spriteRenderQueue.push({
        ...sprite,
        isNpc: true,
    });
};

// Render all queued sprites at once
export const flushSpriteQueue = () => {
    // Sort sprites by y-position for correct depth ordering
    spriteRenderQueue.sort((a, b) => b.y - a.y);

    // Set canvas state once for all sprites
    context.save();
    context.imageSmoothingEnabled = false;

    // Render all sprites in batch
    for (const sprite of spriteRenderQueue) {
        if (sprite.y < sprite.ymax) {
            const scale = sprite.s || 1;
            drawImage(sprite.i, sprite.x, sprite.y, scale);
        }
    }

    // Restore canvas state
    context.restore();

    // Clear the queue
    spriteRenderQueue = [];
};
