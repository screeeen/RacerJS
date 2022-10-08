import {spritesheet, context} from './racer.js'

// Drawing primitive
export const drawImage = (image, x, y, scale) => {
  context.drawImage(
    spritesheet,
    image.x,
    image.y,
    image.w,
    image.h,
    x,
    y,
    scale * image.w,
    scale * image.h
  );
};