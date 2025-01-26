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
    // sprite
    // - sprite props -
    // sprite i {x,y,w,h} dimensiones de pintado h,w,x,y
    // sprite s escala
    // sprite x
    // sprite y
    // sprite ymax altura en el horizonte + el ultimo valor de altura de horizonte registrado...

    const escalaCoche = 0.25;
    // distancia z al player?
    let destY = sprite.y - sprite.i.h * sprite.s * escalaCoche;
    // console.log('y', sprite.y);
    // console.log('.s', sprite.s);
    // console.log('sprite.y', sprite.y);
    // console.log('factor', sprite.i.h * sprite.s * escalaCoche);
    console.log('desty', destY);

    // window.showit = () => console.log(destY);
    // window.changeit = (val) => (destY = val);

    // console.log('i.h', sprite.i.h);
    // console.log('carSprite', carSprite);

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

    // let npcSprite;
    // const imgCarNpc = new Image();
    // imgCarNpc.src = 'sprite_npc.png';
    // npcSprite = {
    //     a: imgCarNpc,
    //     x: 225,
    //     y: 190,
    // };

    // console.log('npcSprite', npcSprite);
    // context.drawImage(
    //     imgCarNpc,
    //     npcSprite.x,
    //     npcSprite.y,
    //     1,
    //     1,
    //     sprite.x,
    //     destY,
    //     sprite.s * sprite.i.w,
    //     sprite.s * h
    // );
};
