import { context } from './racer.js'
import { render } from './src/gameElements.js'
import { drawTrapez } from './drawTrapez.js'
import { rgbToHex, interpolateObjects } from './utils.js'
// import { stages } from './src/stages.js'

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
    const stageLength = 100
    const stages = [
        {
            position: -1,
            name: 'normal',
            startIndex: -1,
            endIndex: -1,
            colors: {
                grass: alternate ? [136, 136, 136] : [102, 102, 102],
                border: alternate ? [238, 238, 238] : [204, 204, 204],
                road: alternate ? [34, 34, 34] : [68, 68, 68],
                lane: alternate ? [170, 170, 170] : [238, 238, 238],
            },
        },
        {
            position: 0,
            name: 'sandy',
            startIndex: 0,
            endIndex: 100,
            colors: {
                grass: [231, 224, 204],
                road: [212, 201, 166],
                lane: [212, 201, 166],
                border: [231, 224, 204],
            },
        },
        {
            position: 1,
            name: 'water',
            startIndex: 100,
            endIndex: 200,
            colors: {
                grass: [0, 0, 204],
                road: [212, 201, 166],
                lane: [212, 201, 166],
                border: [231, 224, 204],
            },
        },
        {
            position: 2,
            name: 'rocky',
            startIndex: 200,
            endIndex: 300,
            colors: {
                grass: alternate ? [10, 10, 10] : [0, 10, 102],
                border: alternate ? [0, 0, 0] : [200, 200, 200],
                road: alternate ? [34, 34, 34] : [68, 68, 68],
                lane: alternate ? [170, 170, 170] : [238, 238, 238],
            },
        },
    ]

    console.log('(absoluteIndex / stageLength)', absoluteIndex / stageLength)

    const currentPhasePosition = Math.floor(absoluteIndex / stageLength) + 1
    const lastPhasePosition = currentPhasePosition - 1
    const currentPhase = stages[currentPhasePosition] || stages[0]
    const lastPhase = stages[lastPhasePosition] || stages[0]

    if (currentPhase.name === undefined) debugger
    if (lastPhase.name === undefined) debugger

    console.log('current', currentPhase.name)
    console.log('last', lastPhase.name)

    let color = {}

    // Color de la carretera en la fase actual
    const t = (absoluteIndex % stageLength) / stageLength
    color = interpolateObjects(lastPhase.colors, currentPhase.colors, t)

    //draw grass:
    // console.log('color.grass', color.grass)

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
