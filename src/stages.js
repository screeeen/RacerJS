export const stages = [
    {
        name: 'sandy',
        startIndex: 500,
        endIndex: 1000,
        colors: {
            grass: [231, 224, 204],
            road: [212, 201, 166],
            lane: [212, 201, 166],
            border: [231, 224, 204],
        },
    },
    {
        name: 'rocky',
        startIndex: 1500,
        endIndex: 2000,
        colors: {
            grass: alternate ? [10, 10, 10] : [0, 10, 102],
            border: alternate ? [0, 0, 0] : [200, 200, 200],
            road: alternate ? [34, 34, 34] : [68, 68, 68],
            lane: alternate ? [170, 170, 170] : [238, 238, 238],
        },
    },
    {
        name: 'normal',
        startIndex: -1,
        endIndex: -1,
        // grass: alternate ? hexToRGB('#888888') : hexToRGB('#666666'),
        // border: alternate ? hexToRGB('#EEEEEE') : hexToRGB('#CCCCCC'),
        // road: alternate ? hexToRGB('#222222') : hexToRGB('#444444'),
        // lane: alternate ? hexToRGB('#AAAAAA') : hexToRGB('#EEEEEE'),

        grass: alternate ? [136, 136, 136] : [102, 102, 102],
        border: alternate ? [238, 238, 238] : [204, 204, 204],
        road: alternate ? [34, 34, 34] : [68, 68, 68],
        lane: alternate ? [170, 170, 170] : [238, 238, 238],
    },
]
