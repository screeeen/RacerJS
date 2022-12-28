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
    const stageLength = 500
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
            endIndex: 500,
            colors: {
                grass: [231, 224, 204],
                road: [212, 201, 166],
                lane: [212, 201, 166],
                border: [231, 224, 204],
            },
        },
        {
            position: 1,
            name: 'rocky',
            startIndex: 500,
            endIndex: 1000,
            colors: {
                grass: alternate ? [10, 10, 10] : [0, 10, 102],
                border: alternate ? [0, 0, 0] : [200, 200, 200],
                road: alternate ? [34, 34, 34] : [68, 68, 68],
                lane: alternate ? [170, 170, 170] : [238, 238, 238],
            },
        },
    ]

    const currentPhase =
        stages.find(
            (phase) =>
                absoluteIndex >= phase.startIndex &&
                absoluteIndex < phase.endIndex
        ) || stages[0]

    const lastPhase =
        currentPhase && currentPhase.position < 1 ? currentPhase : stages[0]

    console.log('current', currentPhase.name)
    console.log('last', lastPhase.name)

    let color = {}

    if (currentPhase) {
        // Color de la carretera en la fase actual
        color = interpolateObjects(
            lastPhase.colors,
            currentPhase.colors,
            absoluteIndex / stageLength
        )
    } else {
        const normal = stages.find((phase) => phase.name === 'normal')
        const normalColors = normal.colors
        Object.keys(normalColors).forEach((key) => {
            color[key] = rgbToHex(
                normalColors[key][0],
                normalColors[key][1],
                normalColors[key][2]
            )
        })
    }

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
