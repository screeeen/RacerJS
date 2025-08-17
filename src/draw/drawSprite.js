// Modificar la importación para usar el contexto correcto
import { context, canvas2D, webglInitialized, spritesheet } from '../racer.js';

export const drawSprite = ({ x, y, s, i }) => {
    // Usar el contexto correcto
    const ctx = webglInitialized ? canvas2D.getContext('2d') : context;
    const destY = sprite.y - sprite.i.h * sprite.s;
    let h;
    if (sprite.ymax < sprite.y) {
        h = Math.min(
            (sprite.i.h * (sprite.ymax - destY)) / (sprite.i.h * sprite.s),
            sprite.i.h
        );
    } else {
        h = sprite.i.h;
    }

    if (h > 0)
        context.drawImage(
            spritesheet,
            sprite.i.x,
            sprite.i.y,
            sprite.i.w,
            h,
            sprite.x,
            destY,
            sprite.s * sprite.i.w,
            sprite.s * h
        );
};
