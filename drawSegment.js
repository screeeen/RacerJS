import { context } from './racer.js'
import { render } from './src/gameElements.js'
import { drawTrapez } from './drawTrapez.js'
import { lerp, rgbToHex, hexToRGB } from './utils.js'

export const drawSegment = (
    position1,
    scale1,
    offset1,
    position2,
    scale2,
    offset2,
    alternate,
    finishStart,
    absoluteIndex
) => {
    let grass = alternate ? '#888' : '#666'
    let border = alternate ? '#EEE' : '#CCC'
    let road = alternate ? '#222' : '#444'
    let lane = alternate ? '#AAA' : '#EEE'

    const sandy = {
        // grass = rgbToHex(lerp(1,100, absoluteIndex);
        grass: '#e7e0cc',
        road: '#d4c9a6',
        lane: '#d4c9a6',
        border: '#e7e0cc',
    }

    const normal = {
        grass: alternate ? '#888' : '#666',
        border: alternate ? '#EEE' : '#CCC',
        road: alternate ? '#222' : '#444',
        lane: alternate ? '#AAA' : '#EEE',
    }
    // let grass = alternate ? "#eda" : "#dc9";
    // var border = "#777";
    // var road = "#7AA";
    // var lane = "#777";

    // console.log('finishStart', finishStart);
    // console.log('absoluteIndex', absoluteIndex);

    //Color Per Stage
    if (absoluteIndex < 500) {
        grass = rgbToHex(lerp(255, 0, absoluteIndex / 500), 100, 100)
        road = '#d4c9a6'
        lane = '#d4c9a6'
        border = '#e7e0cc'
    }

    if (finishStart) {
        road = '#fff'
        lane = '#fff'
        border = '#fff'
    }

    //draw grass:
    context.fillStyle = grass
    context.fillRect(0, position2, render.width, position1 - position2)

    // draw the road
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        -0.5, // ancho carriles
        0.5, // ancho carriles
        road
    )

    // draw the road border
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        -0.5,
        -0.47,
        border
    )

    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        0.47,
        0.5,
        border
    )

    // draw the lane line
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        -0.18,
        -0.15,
        lane
    )
    drawTrapez(
        position1,
        scale1,
        offset1,
        position2,
        scale2,
        offset2,
        0.15,
        0.18,
        lane
    )
}
