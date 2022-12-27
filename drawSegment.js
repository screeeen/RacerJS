import { context } from './racer.js'
import { render } from './src/gameElements.js'
import { drawTrapez } from './drawTrapez.js'
import { rgbToHex, interpolateObjects } from './utils.js'

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
    const sandy = {
        grass: [231, 224, 204],
        road: [212, 201, 166],
        lane: [212, 201, 166],
        border: [231, 224, 204],
        // grass: '#e7e0cc',
        // road: '#d4c9a6',
        // lane: '#d4c9a6',
        // border: '#e7e0cc',
    }

    const normal = {
        // grass: alternate ? hexToRGB('#888888') : hexToRGB('#666666'),
        // border: alternate ? hexToRGB('#EEEEEE') : hexToRGB('#CCCCCC'),
        // road: alternate ? hexToRGB('#222222') : hexToRGB('#444444'),
        // lane: alternate ? hexToRGB('#AAAAAA') : hexToRGB('#EEEEEE'),

        grass: alternate ? [136, 136, 136] : [102, 102, 102],
        border: alternate ? [238, 238, 238] : [204, 204, 204],
        road: alternate ? [34, 34, 34] : [68, 68, 68],
        lane: alternate ? [170, 170, 170] : [238, 238, 238],
    }

    let color = {}

    //Color Per Stage
    if (absoluteIndex < 500) {
        color = interpolateObjects(sandy, normal, absoluteIndex / 500)
    } else {
        color = normal
        Object.keys(normal).forEach((key) => {
            normal[key] = rgbToHex(
                normal[key][0],
                normal[key][1],
                normal[key][2]
            )
        })
    }

    //draw grass:
    context.fillStyle = color.grass
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
        color.road
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
        color.border
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
        color.border
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
        color.lane
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
        color.lane
    )
}
