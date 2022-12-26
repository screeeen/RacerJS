// export const rgbToHex = (r, g, b) => {
//     console.log('r', r)
//     return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
// }

export const componentToHex = (c) => {
    var hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

export const rgbToHex = (r, g, b) => {
    console.log('r', componentToHex(parseInt(r)))
    return (
        '#' +
        componentToHex(parseInt(r)) +
        componentToHex(g) +
        componentToHex(b)
    )
}

export const hexToRGB = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
}

// lerp(valorInicial, valorFinal, porcentajeInterpolacion);
export const lerp = (a, b, t) => {
    // console.log('t', t)
    // console.log('todo', (1 - t) * a + t * b)

    return (1 - t) * a + t * b
}

export const interpolateObjects = (start, end, t) => {
    const result = {}
    Object.keys(start).forEach((key) => {
        result[key] = (1 - t) * start[key] + t * end[key]
    })
    return result
}
