export const componentToHex = (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
};

export const rgbToHex = (r, g, b) => {
    return (
        '#' +
        componentToHex(parseInt(r)) +
        componentToHex(g) +
        componentToHex(b)
    );
};

// RNG seeded para roads reproducibles. setSeed antes de generateRoad.
let _seed = (Date.now() & 0x7fffffff) || 1;
export const setSeed = (s) => {
    _seed = (s | 0) || 1;
};
export const getSeed = () => _seed;
export const r = () => {
    _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
    return _seed / 0x7fffffff;
};

export const interpolateObjects = (start, end, t) => {
    const result = {};
    Object.keys(start).forEach((key) => {
        result[key] = rgbToHex(
            Math.floor((1 - t) * start[key][0] + t * end[key][0]),
            Math.floor((1 - t) * start[key][1] + t * end[key][1]),
            Math.floor((1 - t) * start[key][2] + t * end[key][2])
        );
    });
    return result;
};

export const interpolateObject = (start, end, t) => {
    const result = {};
    Object.keys(start).forEach((key) => {
        result[key] = rgbToHex(
            Math.floor((1 - t) * start[key][0] + t * end[key][0]),
            Math.floor((1 - t) * start[key][1] + t * end[key][1]),
            Math.floor((1 - t) * start[key][2] + t * end[key][2])
        );
    });
    return result;
};

// export const hexToRGB = (hex) => {
//     const r = parseInt(hex.slice(1, 3), 16);
//     const g = parseInt(hex.slice(3, 5), 16);
//     const b = parseInt(hex.slice(5, 7), 16);
//     return [r, g, b];
// };

// export const lerp = (a, b, t) => {
//     return (1 - t) * a + t * b
// }
