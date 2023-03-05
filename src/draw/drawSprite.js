import { spritesheet, context } from '../racer.js';

export const drawSprite = (sprite) => {
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

    //sprite.y - sprite.i.h * sprite.s
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
    //}
};

export const drawNpcSprite = (sprite) => {
    console.log(' * spr', sprite);
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

    const img = new Image();
    img.src = 'sprite_npc.png';

    if (h > 0)
        context.drawImage(
            img,
            sprite.i.x,
            sprite.i.y,
            sprite.i.w,
            h,
            sprite.x,
            destY,
            sprite.s * sprite.i.w,
            sprite.s * h
        );
    //}
};
