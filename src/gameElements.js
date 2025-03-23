import { getBackgroundColor } from './getBackgroundColor.js';

export const render = {
    width: 320,
    height: 240,
    leftRoadBound: -0.5,
    rightRoadBound: 0.5,
    depthOfField: 150,
    camera_distance: 20,
    camera_height: 80,
};

export const player = {
    position: 10,
    speed: 0,
    acceleration: 0.02,
    deceleration: 0.2,
    breaking: 0.6,
    turning: 6.0,
    posx: 0.5,
    maxSpeed: 40,
};

// this is somehow stupid
export const resetPlayer = (player) => {
    player.position= 10;
    player.speed= 0;
    player.acceleration= 0.02;
    player.deceleration= 0.2;
    player.breaking= 0.6;
    player.turning= 6.0;
    player.posx= 0.5;
    player.maxSpeed= 40;
}

//sprites
export const car = {
    x: 0,
    y: 130,
    w: 69,
    h: 38,
};
export const car_4 = {
    x: 70,
    y: 130,
    w: 77,
    h: 38,
};
export const car_8 = {
    x: 148,
    y: 130,
    w: 77,
    h: 38,
};

export const topclouds = {
    x: 0,
    y: 9,
    w: 320,
    h: 80,
};

export const background = {
    x: 0,
    y: 89,
    w: 320,
    h: 40,
};

export const tree = {
    x: 321,
    y: 9,
    w: 16,
    h: 32,
};

export const palm = {
    x: 416,
    y: 41,
    w: 24,
    h: 56,
};

export const rock = {
    x: 345,
    y: 9,
    w: 11,
    h: 14,
};

export const bridge = {
    x: 336,
    y: 98,
    w: 336,
    h: 88,
};

export const house = {
    x: 440,
    y: 41,
    w: 72,
    h: 42,
};

export const logo = {
    x: 161,
    y: 39,
    w: 115,
    h: 20,
};

export const backgroundColor = getBackgroundColor();

